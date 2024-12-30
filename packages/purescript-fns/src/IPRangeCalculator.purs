module IPRangeCalculator
  ( IPRange
  , cleanupIpRanges
  , ipRangeRegex
  , mergeIpRanges
  , parseIPRange
  , parseIPRanges
  , renderIpRanges
  , sortIpRanges
  , subtractIPRangesAsRecord
  , subtractIpRanges
  , subtractIpRangesFromString
  , validateIPRanges
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Array (foldl, foldr, fromFoldable)
import Data.Array.NonEmpty (toArray)
import Data.Either (Either(..), note)
import Data.Int as Int
import Data.List (List(..), range, sortBy, (:))
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), joinWith, split, trim)
import Data.String.Regex (Regex, match, parseFlags, regex)
import JS.BigInt (BigInt, and, fromInt, or, shl, shr)
import JS.BigInt as BigInt
import Partial.Unsafe (unsafeCrashWith)

type IPRange =
  { start :: BigInt
  , end :: BigInt
  }

fromRightWithError :: forall t e. String -> Either e t -> t
fromRightWithError error (Left _) = unsafeCrashWith error
fromRightWithError _ (Right r) = r

ipRangeRegex :: Regex
ipRangeRegex =
  fromRightWithError "Cannot parse regex"
    ( regex "^([0-9]+)\\.([0-9]+)\\.([0-9]+)\\.([0-9]+)/([0-9]+)$" (parseFlags "")
    )

subtractIpRangesFromString :: String -> String -> Either String String
subtractIpRangesFromString allowedStr disallowedStr = do
  allowed <- parseIPRanges allowedStr
  disallowed <- parseIPRanges disallowedStr
  Right
    ( renderIpRanges
        ( subtractIpRanges (cleanupIpRanges allowed) (cleanupIpRanges disallowed)
        )
    )

parseIPRange :: String -> Either String IPRange
parseIPRange str = do
  m <- note ("Unable to match " <> str <> " as an IP range") (match ipRangeRegex str)
  matches <- case toArray m of
    [ _, Just a1, Just a2, Just a3, Just a4, Just l ] -> Right { address: [ a1, a2, a3, a4 ], length: l }
    _ -> Left "Cannot match regex"
  address <-
    let
      f acc s = do
        a <- acc
        i <- note "Cannot parse int" (Int.fromString s)
        if i < 0 || i > 255 then Left "Invalid IP address component"
        else Right (shl a b8 + fromInt i)
    in
      (foldl f (Right b0) matches.address)
  length <- note "Cannot parse int" (BigInt.fromString matches.length)
  Right
    ( let
        mask = (shl b1 (b32 - length)) - b1
      in
        { start: and address (BigInt.not mask), end: or address mask }
    )

parseIPRanges :: String -> Either String (List IPRange)
parseIPRanges =
  split (Pattern ",")
    >>> map (trim >>> parseIPRange)
    >>>
      (foldr (lift2 Cons) (Right Nil))

sortIpRanges :: List IPRange -> List IPRange
sortIpRanges = sortBy cmp
  where
  cmp a b = compare (a.start) (b.start)

mergeIpRanges :: List IPRange -> List IPRange
mergeIpRanges (a : b : xs) =
  if a.end >= b.start - b1 then { start: a.start, end: b.end } : mergeIpRanges xs
  else a : (mergeIpRanges (b : xs))
mergeIpRanges xs = xs

cleanupIpRanges :: List IPRange -> List IPRange
cleanupIpRanges = sortIpRanges >>> mergeIpRanges

subtractIpRanges :: List IPRange -> List IPRange -> List IPRange
subtractIpRanges Nil _ = Nil
subtractIpRanges a Nil = a
subtractIpRanges (a : as) (b : bs) =
  -- check for non-intersecting a and b
  if a.end < b.start then a : subtractIpRanges as (b : bs)
  else if b.end < a.start then subtractIpRanges (a : as) bs
  -- a and b definitely intersects
  else if b.start <= a.start && a.end <= b.end
  -- b fully covers a, delete a but preserve b since it can delete others
  then subtractIpRanges as (b : bs)
  else if a.start < b.start && b.end < a.end
  -- a fully covers b, need to split into two. The first part of a is clear, but the next part might be matched with other b
  then { start: a.start, end: b.start - b1 } : subtractIpRanges ({ start: b.end + b1, end: a.end } : as) bs
  else if b.start <= a.start
  -- b is behind a, a "shrinks" but it can still be matched with other b
  then subtractIpRanges ({ start: b.end + b1, end: a.end } : as) bs
  -- b.end >= a.end
  -- a is behind b, current a is clear but b can match other a
  else { start: a.start, end: b.start - b1 } : subtractIpRanges as (b : bs)

renderIpRanges :: List IPRange -> String
renderIpRanges = renderIpRanges' >>> fromFoldable >>> joinWith ", "
  where
  renderIpRanges' :: List IPRange -> List String
  renderIpRanges' Nil = Nil
  renderIpRanges' (x : xs) = (renderRange x) <> (renderIpRanges' xs)

  renderRange :: IPRange -> List String
  renderRange x =
    let
      block_length = maxBlockLength x.start x.end
      block_end = x.start + shl b1 block_length - b1
    in
      (renderPrefix x.start <> "/" <> show (b32 - block_length)) :
        ( if block_end == x.end then Nil
          else (renderRange { start: block_end + b1, end: x.end })
        )

  renderPrefix start = joinWith "." $ fromFoldable (map (componentAt >>> show) (map fromInt $ range 1 4))
    where
    componentAt i =
      let
        shn = (b4 - i) * b8
      in
        shr (and start (shl b255 shn)) shn

maxBlockLength ∷ BigInt → BigInt → BigInt
maxBlockLength start end = mbl start end b1
  where
  mbl s e i =
    let
      mask = shl b1 i - b1
    in
      if and s mask == b0 && s + mask <= e then mbl s e (i + b1)
      else i - b1

subtractIPRangesAsRecord :: String -> String -> { error :: String, result :: String }
subtractIPRangesAsRecord a b = case (subtractIpRangesFromString a b) of
  Right result -> { result, error: "" }
  Left error -> { result: "", error }

validateIPRanges :: String -> String
validateIPRanges s = case parseIPRanges s of
  Right _ -> ""
  Left message -> message

b0 :: BigInt
b0 = fromInt 0

b1 :: BigInt
b1 = fromInt 1

b4 :: BigInt
b4 = fromInt 4

b8 :: BigInt
b8 = fromInt 8

b32 :: BigInt
b32 = fromInt 32

b255 :: BigInt
b255 = fromInt 255
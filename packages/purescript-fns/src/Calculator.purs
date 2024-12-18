module Calculator
  ( IPRange
  , calcAsRecord
  , fromRightWithError
  , ipRangeRegex
  , mergeIpRanges
  , parseIPRange
  , parseIPRanges
  , renderIpRanges
  , sortIpRanges
  , subtractIpRanges
  )
  where

import Prelude

import Control.Apply (lift2)
import Data.Array (foldl, foldr, fromFoldable)
import Data.Array.NonEmpty (toArray)
import Data.Either (Either(..), note)
import Data.List (List(..), concat, range, sortBy, (:))
import Data.Maybe (Maybe(..))
import Data.String (Pattern(..), joinWith, split, trim)
import Data.String.Regex (Regex, match, parseFlags, regex)
import JS.BigInt (BigInt, and, fromInt, not, or, shl, shr)
import JS.BigInt as BigInt
import Partial.Unsafe (unsafeCrashWith)

type IPRange = {
    start :: BigInt,
    end :: BigInt
}

fromRightWithError :: forall t e. String -> Either e t -> t
fromRightWithError error (Left _) = unsafeCrashWith error
fromRightWithError _ (Right r) = r

ipRangeRegex :: Regex
ipRangeRegex = 
    fromRightWithError "Cannot parse regex" ( 
        regex "([b0-b9]+)\\.([b0-b9]+)\\.([b0-b9]+)\\.([b0-b9]+)/([b0-b9]+)" (parseFlags "") 
    )


calc :: String -> String -> Either String String
calc allowedStr disallowedStr = do 
    allowed <- parseIPRanges allowedStr
    disallowed <- parseIPRanges disallowedStr
    Right (renderIpRanges (
        subtractIpRanges (cleanupIpRanges allowed) (cleanupIpRanges disallowed)
    ))

parseIPRange :: String -> Either String IPRange
parseIPRange str = do
    m <- note ("Unable to match " <> str <> " as an IP range" ) (match ipRangeRegex str)
    matches <- case toArray m of
      [_, Just a1, Just a2, Just a3, Just a4, Just l] -> Right {address: [a1, a2, a3, a4], length: l}
      _ -> Left "Cannot match regex"
    address <- let f acc s = do 
                                a <- acc
                                i <- note "Cannot parse int" (BigInt.fromString s)
                                Right (shl a b8 + i)
                in (foldl f (Right b0) matches.address)
    length <- note "Cannot parse int" (BigInt.fromString matches.length)
    Right (let mask = (shl b1 (b32 - length)) - b1 
            in {start: and address (not mask), end: or address mask})

parseIPRanges :: String -> Either String (List IPRange)
parseIPRanges = 
    split (Pattern ",") >>> 
    map (trim >>> parseIPRange) >>> 
    (foldr (lift2 Cons) (Right Nil))


sortIpRanges :: List IPRange -> List IPRange
sortIpRanges = sortBy cmp
    where cmp a b = compare (a.start) (b.start)

mergeIpRanges :: List IPRange -> List IPRange
mergeIpRanges (a:b:xs) = if a.end >= b.start - b1
                         then {start: a.start, end: b.end} : mergeIpRanges xs
                         else a:(mergeIpRanges (b:xs))
mergeIpRanges xs = xs

cleanupIpRanges :: List IPRange -> List IPRange
cleanupIpRanges = sortIpRanges >>> mergeIpRanges

subtractIpRanges :: List IPRange -> List IPRange -> List IPRange
subtractIpRanges Nil _ = Nil
subtractIpRanges a Nil = a
subtractIpRanges (a:as) (b:bs) = 
    if a.end < b.start
    then a : subtractIpRanges as (b:bs)
    else if b.end < a.start
    then subtractIpRanges (a:as) bs
    else -- a and b definitely intersects
    if b.start <= a.start && a.end <= b.end
    then subtractIpRanges as (b:bs)
    else if a.start < b.start && b.end < a.end
    then {start: a.start, end: b.start - b1} : {start: b.end + b1, end: a.end} : subtractIpRanges as bs
    else if b.start <= a.start
    then {start: b.end + b1, end: a.end} : subtractIpRanges as bs
    else --  b.end >= a.end
         {start: a.start, end: b.start - b1} : subtractIpRanges as (b:bs)

renderIpRanges :: List IPRange -> String
renderIpRanges = renderIpRanges' >>> fromFoldable >>> joinWith ", "
    where 
        renderIpRanges' Nil = Nil
        renderIpRanges' (x:xs) = concat ((renderRange x) : (renderIpRanges' xs) : Nil)
        renderRange x
          | x.start >= x.end = Nil
          | otherwise =
                        let start_length = zeroBitCount x.start
                            end_length = zeroBitCount (x.end + b1)
                            min_length = if start_length < end_length then start_length else (end_length - b1)
                        in 
                            (renderPrefix x.start <> "/" <> show (b32 - min_length)) :
                            (if start_length == (end_length - b1)
                             then Nil
                             else (renderRange {start: x.start + (shl b1 min_length), end: x.end}))
        renderPrefix n = joinWith "." $ fromFoldable (map (sc >>> show) (map fromInt $ range 1 4))
            where sc i = let shn = (b4 - i) * b8
                         in shr (and n (shl b255 shn)) shn

zeroBitCount :: BigInt -> BigInt
zeroBitCount x' = zbc x' 1
    where
        zbc :: BigInt -> Int -> BigInt
        zbc x p 
            | p >= 32 = fromInt 32
            | otherwise = let mask = shl b1 (fromInt p) - b1 in
                            if and x mask == b0
                            then zbc x (p + 1)
                            else ((fromInt p) - b1)

calcAsRecord :: String -> String -> { error :: String, result :: String }
calcAsRecord a b = case (calc a b) of 
    Right result -> { result, error: "" }
    Left error -> {result: "", error }


b0 :: BigInt
b0 = fromInt 0
b1 :: BigInt
b1 = fromInt 1
b4 :: BigInt
b4 = fromInt 4
b8 :: BigInt
b8 = fromInt 8
b9 :: BigInt
b9 = fromInt 9
b32 :: BigInt
b32 = fromInt 32
b255 :: BigInt
b255 = fromInt 255
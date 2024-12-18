module Test.Main where

import Prelude

import Calculator (mergeIpRanges, parseIPRange, parseIPRanges, renderIpRanges, sortIpRanges, subtractIpRanges)
import Control.Apply (lift2)
import Data.Either (Either(..), isRight)
import Data.List as List
import Effect (Effect)
import Effect.Aff (Aff)
import JS.BigInt (fromInt, shl)
import Test.Unit (suite, test)
import Test.Unit.Assert as Assert
import Test.Unit.Main (runTest)

main :: Effect Unit
main = do
  runTest do
    suite "parseIpRange" do
      test "0.0.0.0/0" do
        Assert.equal (Right { start: fromInt 0, end: (shl (fromInt 1) (fromInt 32)) - fromInt 1 }) $ parseIPRange "0.0.0.0/0"
      test "10.0.0.0/8" do
        Assert.equal (Right { start: (shl (fromInt 10) (fromInt 24)), end: (shl (fromInt 11) (fromInt 24) - (fromInt 1)) }) $ parseIPRange "10.0.0.0/8"

    suite "parseIPRanges" do
      test "works" do
        ( rightAndEqual
            ( do
                i1 <- parseIPRange "10.0.0.0/8"
                i2 <- parseIPRange "11.0.0.0/8"
                Right (List.fromFoldable [ i1, i2 ])
            )
            (parseIPRanges "10.0.0.0/8, 11.0.0.0/8")
        )

    suite "sortIPRanges" do
      test "works" do
        ( rightAndEqual
            (parseIPRanges "10.0.0.0/8, 11.0.0.0/8")
            ((map sortIpRanges) (parseIPRanges "11.0.0.0/8, 10.0.0.0/8"))
        )

    suite "mergeIPRanges" do
      test "works" do
        ( rightAndEqual
            (parseIPRanges "10.0.0.0/8")
            ((map mergeIpRanges) (parseIPRanges "10.0.0.0/9, 10.128.0.0/9"))
        )

    suite "subtractIpRanges" do
      test "test1" do
        ( rightAndEqual
            (parseIPRanges "10.0.0.128/25,10.0.1.128/25")
            ( (lift2 subtractIpRanges)
                (parseIPRanges "10.0.0.0/24,10.0.1.0/24")
                (parseIPRanges "10.0.0.0/25,10.0.1.0/25")
            )
        )
      test "test2" do
        ( rightAndEqual
            (parseIPRanges "128.0.0.0/1")
            ( (lift2 subtractIpRanges)
                (parseIPRanges "0.0.0.0/0")
                (parseIPRanges "0.0.0.0/1")
            )
        )

    suite "renderIpRanges" do
      test "test1" do
        ( rightAndEqual
            (Right "10.0.0.128/25")
            ((map renderIpRanges) (parseIPRanges "10.0.0.128/25"))
        )

      test "test2" do
        ( rightAndEqual
            (Right "0.0.0.0/2, 64.0.0.0/3, 96.0.0.0/4, 112.0.0.0/5, 120.0.0.0/6, 124.0.0.0/7, 126.0.0.0/8, 127.0.0.0/32, 127.0.0.2/31, 127.0.0.4/30, 127.0.0.8/29, 127.0.0.16/28, 127.0.0.32/27, 127.0.0.64/26, 127.0.0.128/25, 127.0.1.0/24, 127.0.2.0/23, 127.0.4.0/22, 127.0.8.0/21, 127.0.16.0/20, 127.0.32.0/19, 127.0.64.0/18, 127.0.128.0/17, 127.1.0.0/16, 127.2.0.0/15, 127.4.0.0/14, 127.8.0.0/13, 127.16.0.0/12, 127.32.0.0/11, 127.64.0.0/10, 127.128.0.0/9, 128.0.0.0/1")
            ( do
                allowed <- parseIPRanges "0.0.0.0/0"
                disallowed <- parseIPRanges "127.0.0.1/32"

                Right (renderIpRanges (subtractIpRanges allowed disallowed))
            )
        )

rightAndEqual ∷ forall a b. Eq a => Eq b => Show a => Show b => Either a b -> Either a b -> Aff Unit
rightAndEqual a b = do
  Assert.equal (isRight a) true
  Assert.equal (isRight b) true
  Assert.equal a b
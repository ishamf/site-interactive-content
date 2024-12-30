module Test.Main
  ( main
  ) where

import Prelude

import Control.Apply (lift2)
import Data.Either (Either(..), isRight)
import Data.List as List
import Effect (Effect)
import Effect.Aff (Aff)
import IPRangeCalculator (mergeIpRanges, parseIPRange, parseIPRanges, renderIpRanges, sortIpRanges, subtractIpRanges, subtractIpRangesFromString)
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

    suite "e2e" do
      test "test1" do
        ( rightAndEqual
            (Right "10.4.0.0/14, 10.8.0.0/13, 10.16.0.0/12, 10.32.0.0/11, 10.64.0.0/10, 10.128.0.0/9")
            ( subtractIpRangesFromString
                "10.0.0.0/8"
                "10.0.0.0/14"
            )
        )

      test "test2" do
        ( rightAndEqual
            (Right "1.0.0.0/8, 2.0.0.0/7, 4.0.0.0/6, 8.0.0.0/7, 10.0.0.0/14, 11.0.0.0/8, 12.0.0.0/6, 16.0.0.0/4, 32.0.0.0/3, 64.0.0.0/3, 96.0.0.0/4, 112.0.0.0/5, 120.0.0.0/6, 124.0.0.0/7, 126.0.0.0/8, 128.0.0.0/5, 136.0.0.0/6, 140.0.0.0/7, 142.0.0.0/9, 142.128.0.0/10, 142.192.0.0/11, 142.224.0.0/12, 142.240.0.0/13, 142.248.0.0/15, 142.250.0.0/16, 142.251.0.0/17, 142.251.128.0/19, 142.251.160.0/21, 142.251.168.0/22, 142.251.172.0/23, 142.251.174.0/24, 142.251.175.0/25, 142.251.175.128/29, 142.251.175.136/31, 142.251.175.139/32, 142.251.175.140/30, 142.251.175.144/28, 142.251.175.160/27, 142.251.175.192/26, 142.251.176.0/20, 142.251.192.0/18, 142.252.0.0/14, 143.0.0.0/8, 144.0.0.0/6, 148.0.0.0/7, 150.0.0.0/8, 151.0.0.0/10, 151.64.0.0/11, 151.96.0.0/14, 151.100.0.0/16, 151.101.0.0/17, 151.101.128.0/26, 151.101.128.64/28, 151.101.128.80/32, 151.101.128.82/31, 151.101.128.84/30, 151.101.128.88/29, 151.101.128.96/27, 151.101.128.128/25, 151.101.129.0/24, 151.101.130.0/23, 151.101.132.0/22, 151.101.136.0/21, 151.101.144.0/20, 151.101.160.0/19, 151.101.192.0/18, 151.102.0.0/15, 151.104.0.0/13, 151.112.0.0/12, 151.128.0.0/9, 152.0.0.0/5, 160.0.0.0/5, 168.0.0.0/8, 169.0.0.0/9, 169.128.0.0/10, 169.192.0.0/11, 169.224.0.0/12, 169.240.0.0/13, 169.248.0.0/14, 169.252.0.0/15, 169.255.0.0/16, 170.0.0.0/7, 172.0.0.0/12, 172.32.0.0/11, 172.64.0.0/10, 172.128.0.0/9, 173.0.0.0/8, 174.0.0.0/7, 176.0.0.0/4, 192.0.0.0/9, 192.128.0.0/11, 192.160.0.0/13, 192.169.0.0/16, 192.170.0.0/15, 192.172.0.0/14, 192.176.0.0/12, 192.192.0.0/10, 193.0.0.0/8, 194.0.0.0/7, 196.0.0.0/6, 200.0.0.0/5, 208.0.0.0/4, 224.0.0.0/4")
            ( subtractIpRangesFromString
                "0.0.0.0/0"
                "0.0.0.0/8, 10.4.0.0/14, 10.8.0.0/13, 10.16.0.0/12, 10.32.0.0/11, 10.64.0.0/10, 10.128.0.0/9, 127.0.0.0/8, 169.254.0.0/16, 172.16.0.0/12, 192.168.0.0/16, 240.0.0.0/4, 151.101.128.81/32, 142.251.175.138/32"
            )
        )

rightAndEqual ∷ forall a b. Eq a => Eq b => Show a => Show b => Either a b -> Either a b -> Aff Unit
rightAndEqual a b = do
  Assert.equal (isRight a) true
  Assert.equal (isRight b) true
  Assert.equal a b
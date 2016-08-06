CorrectHorseBatteryStaple
=========================

Password generator, loosely (read: entirely) based on XKCD 936

[Use it here!](https://fsmaxb.github.io/correcthorsebatterystaple)

This is a fork of the [original](http://correcthorsebatterystaple.net) by [JVDL](http://twitter.com/geekyjohn)

Changes since the fork:
* Use cryptographically secure random number generator instead of `Math.random()`.
* Don't load content from third party servers. (local jquery, removed Google Analytics).
* Change defaults: No uppercase, space as separator, no number appended

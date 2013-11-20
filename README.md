# Discover Poetry Together

Curate, collect, and read poems from the public domain. From any device. For free.

## Overview

The poetroid platform consists of three parts: web, engine, and data.

You're in the web--it's opensourced.

Data is currently [poems from the public domain](https://github.com/Facjure/poetroid-public-domain). Public domain should always be opensourced.

The engine, not opensourced yet, runs on the cloud as a distributed server.

There is no mobile: [responsive web design](http://en.wikipedia.org/wiki/Responsive_web_design) _is_ mobile.

## Status and Roadmap

Prototyping. Currently in *Research & Development*.

The current [web](http://www.poetroid.com) is a static site, with in-built regex search, hosting 2000 poems. Editors can add, edit, and curate tags and metadata via an inline markdown editor with live-preview. The site automatically updates via a github-hook that routes to [literatti](https://github.com/Facjure/literatte) compiler running on the cloud.

Once the engine is ready for alpha, the _web_ will be rewritten in clojurescript.

## Usage

Built with [Literatti](https://github.com/Facjure/literatte).

## Documentation

Coming soon.

## Contributers

- Priyatam Mudivarti: writer, engineer, and founder of Facjure LLC
- Sreeharsha Mudivarti: musician, engineer, and survivor of a space ship crash.

If you're a web developer and wants to move litarature forward, help, send a pull request!

## Copyright & License

Copyright (c) Facjure LLC. All rights reserved.

The use and distribution terms for this software are covered by [Eclipse Plugin License v 1.0](http://opensource.org/licenses/eclipse-1.0.php), which can be found in the file LICENSE at the root of this distribution.

By using this software in any fashion, you are agreeing to be bound by the terms of this license. You must not remove this notice, or any other, from this software.

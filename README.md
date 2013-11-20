# Discover Poetry Together

Curate, View, and Discover thousands of poems from the public domain. On any device. For free.

## Overview

The poetroid platform consists of three parts: web, engine, and data.

Web: you're in it, and it's opensource.

Engine: is not opensourced yet, and runs on the cloud as a distributed server. It's written in Clojure.

Data: is opensource, and is available as free poems in [poetrid-public-domain](https://github.com/Facjure/poetroid-public-domain).

There is no mobile: [Responsive Web Design](http://en.wikipedia.org/wiki/Responsive_web_design) _is_ mobile.

## Status and Roadmap

Prototyping / R&D.

[Here you go](http://www.poetroid.com).

Currently, a static site with in-built regex search hosts ~2000 poems, handcrafted one poem at a time. All poems are saved in github. Editors can add, edit, and curate tags and metadata via an inline Markdown editor with live-preview. Any changes are refreshed automatically via a github-hook that routes to [Literatti](https://github.com/Facjure/literatte), our compiler running on the cloud, and rebuilds the site.

Once the engine is ready the _web_ will be rewritten, along with new features, in Clojurescript.

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

# Workshop DL CLI

## Development / ToDo

This application was originally developed in early 2020 specifically for Cities:
Skyline mods as https://github.com/Kumar-Saksham/CSMM-CLI by Kumar-Saksham.

A number of dependencies were subsequently updated. However, a thorough review
should be done to evaluate what other dependencies should now be removed or
replaced. For example, oclif includes a number of ux functions that may be able
to replace some other packages currently being used in the project, such as
potentially replacing the separately-included equirer package with the
oclif-included prompt functionality, and the separately-included cli-table
('logger') functionality with the oclif-included progress functionality.
However, before making such changes, re-review the existing output.

The app ID should be obtained from [data-appid] instead of harcoded.

### Package selection

To reduce the risk of malicious packages, use packages that are:

1. From established companies
2. Are frequently-used within the community

#### Browser

Playwright used instead of Puppeteer because of better file download and
auto-wait functoinality.

#### Command line

oclif is from Salesforce, and its architecture uses one command per file which I
find beneficial (although it isn't as popular as packages such as Commander or
Yargs).

#### Configuration

It's desired for the package to support a number of defaults, while also
allowing users to customize configuration options if desired.
conf seems popular within the community.

## Overview

Alternative Steam Workshop download manager

![](demo/demo.svg)

A number of games use Steam Workshop for their mods. Unfortunately, for a number
of games this means that users who have bought the game on a different platform
such as GOG or Epic Games may be unable to download the mods. This tool assists
in the process of downloading mods from Steam Workshop for non-Steam owners.

csmm-cli is a command line application to manage your Cities: Skylines mods. It
lets you install any mod or collection from Cities: Skyline's [steam workshop
page](https://steamcommunity.com/app/255710/workshop/), uninstall a mod if you
don't need it any more, or update your installed mods. It automates most of your
work to manage mods and does it reliably and quickly, allowing you to spend more
time playing and less time getting frustrated.

### Features

* Install single mod or collection
* Required mods installed automatically
* Concurrent installations to optimize speed
* Multiple sources to install mods from
* Uninstall multiple mods at once
* Update all mods at once
* List all installed mods
* Supports multiplatform

## Table of Contents

* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
  * [Commands](#commands)
* [FAQ](#frequently-asked-questions)
* [License](#license)

## Getting Started

### Prerequisites

* Install  [Node.js](https://nodejs.org/en/download/ "NodeJS download page") if
  you haven't already.
* Delete any mods installed previously.
* Backup your game's saves directory.

### Installation
<!-- installation -->
`csmm-cli` is distributed on npm. In order to install it globally, run the
following command:

```bash
$ npm install -g csmm-cli
```

## Usage

When you run the CLI for the first time it will ask you a few configuration
questions.

* *`Max Concurrent Tasks`*: Maximum no. of simultaneous downloads or fetching.

* *`Saves Directory`*: Your Cities: Skylines [user
  path](https://skylines.paradoxwikis.com/User_path).
* *`Temporary Downloads Folder`*: Folder to store temporary downloads.

If the pre-filled details are correct, just press enter (or return) otherwise
you can fill in your own custom details.

### Commands
<!-- commands -->
* [`install`](#csmm-install-steamid)
* [`uninstall`](#csmm-uninstall-steamid)
* [`update`](#csmm-update)
* [`list`](#csmm-list)
* [`config`](#csmm-config)
* [`help`](#csmm-help-command)

## `csmm install <steamId>`

Install a single mod, complete collection or part of collection along with all
of their dependencies.

```
USAGE
  $ csmm install <steamId> [options]

ARGUMENTS
  steamId                     steamId of item/collection

OPTIONS
  -e, --edit                  To edit items of a collection before install.
  -s, --source={SWD|SMODS}  To set download source [default: SWD] .
```

Use id in steam workshop's URL for `<steamId>`.

## `csmm uninstall [<steamId>]`

Uninstall a single item or choose from an interactive list.

```
USAGE
  $ csmm uninstall [<steamId>]

ARGUMENTS
  steamId (Optional)           steamId of installed item
```

Use the command with `<steamId>` to uninstall a single mod. Executing command
without `<steamId>` will provide an interactive list to uninstall multiple items
at once.

## `csmm update`

Updates all outdated mods at once, and also installs missing dependencies if
any.

```
USAGE
  $ csmm update
```

## `csmm list`

Lists all installed mods.

```
USAGE
  $ csmm list
```

## `csmm config`

Re-run configuration setup, to modify :

* *`Max Concurrent Tasks`*
* *`Saves Directory`*
* *`Temporary Downloads Folder`*

```
$ csmm config
```

All previously saved configuration values will be preserved.

## `csmm help [command]`

Display help for `csmm-cli` commands.

```
USAGE
  $ csmm help [command] [options]

ARGUMENTS
  command (optional)            command to show help for

OPTIONS
  --all                         see all commands in CLI
```


<!-- commandsstop -->

## Frequently Asked Questions

* **Is there a detailed guide on how to use this?**
  * Yes, [here](guide/detailed.md)
* **I am having a lot of `BAD FILE` failures while installing mods.**
  * The **`BAD FILE`** error usually happens because the downloaded file is
    corrupt or empty. This can be fixed by changing the source of installation
    to `SMODS`. Go through the [guide](guide/detailed.md) on how to do it.
* **Some of the items keep failing repeatedly with `[!]` symbol, and the script
  doesn't end.**
  * This is a known bug, which will be fixed later. For now, if the script seems
    to be stuck in a loop, giving `[!]` symbol for the same item repeatedly, use
    `ctrl + c` to terminate the script.
* **Which terminal are you using?**
  * I'm using [Hyper](https://hyper.is/), with zsh.

## License

[MIT license](./LICENSE) Copyright 2020

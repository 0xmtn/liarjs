# liar

Populate a fake, but real-life db data.

## Getting Started
Install the module with: `npm install liar`

```shell
..:* mtn$ liar path/to/model/schema
```

## Documentation
_(Coming soon)_

## Examples
```shell
..:* mtn$ liar models/_sch_usermedia.js 
Creating Maps..
Clearing unnecessary fields
Indentified schema types are as follows: 
0. userID: id
1. media.mediaUrl: media
2. media.dateAdded: date
3. media._id: id
Is this correct? (y/n): n
Type the number of the pathmap that you want to change type of: 2
id: Is this path an id (I.e. 45678)?
name: Is this path a name field (i.e John)?
middlename: Is this path a middle name field (i.e Carl)?
surname: Is this path a surname field (i.e Jackson)?
fullname: Is this path a fullname field (i.e Gary Nick Scherzinger)?
url: Is this path a site url or permalink field (i.e http://google.com)?
mediaUrl: Is this path a media url field (i.e )?
date: Is this path a date field (i.e 2013-04-15)?
dateAndTime: Is this path a datetime field (i.e 2012-05-23 14:03:56)?
time: Is this path a time field (i.e 08:13:42)?
Pick a type from the list above: dateAndTime
Renewed schema types are as follows:
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 Metin Emenullahi  
Licensed under the MIT license.

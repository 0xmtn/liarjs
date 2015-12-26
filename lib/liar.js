#! /usr/bin/env node
/*
 * liar
 * https://github.com/mtndesign/liarjs
 *
 * Copyright (c) 2015 Metin Emenullahi
 * Licensed under the MIT license.
 */
var readline = require("readline");
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var supported_fieldnames = ["id", "name", "address", "geo", "media", "text", "random word", "date", "url"];

var type_dict = {"id": "Is this path an id (I.e. 45678)?",
                 "name": "Is this path a name field (i.e John)?",
                 "middlename": "Is this path a middle name field (i.e Carl)?",
                 "surname": "Is this path a surname field (i.e Jackson)?",
                 "fullname": "Is this path a fullname field (i.e Gary Nick Scherzinger)?",
                 "username": "Is this path a username field (i.e nick90)?",
                 "url": "Is this path a site url or permalink field (i.e http://google.com)?",
                 "mediaUrl": "Is this path a media url field (i.e )?",
                 "date": "Is this path a date field (i.e 2013-04-15)?",
                 "dateAndTime": "Is this path a datetime field (i.e 2012-05-23 14:03:56)?",
                 "time": "Is this path a time field (i.e 08:13:42)?"};

var correlated_fields = {"name": ["name", "surname", "fullname", "middlename", "username", "firstName", "lastName"],
                         "url": ["mediaUrl", "siteUrl"],
                         "date": ["date", "dateAndTime", "time"]};

var arguments = process.argv.slice(2);
var SchemaPath = arguments[0];

var schema_paths = require("../"+ SchemaPath).schema.paths;
var liar_paths = [];
var liar_path_maps = [];
console.log("Creating Maps..");
create_path_maps(schema_paths);
console.log("Clearing unnecessary fields");
clear_pathmaps();
//convert_pathmaps();
festival(function(err, result){
  if(err) console.log(err);
  else{
    confirm("Indentified schema types are as follows: ");
  }

});


function confirm(sentence){
  console.log(sentence);
  for(var idx in liar_path_maps){
    console.log(idx +". "+liar_path_maps[idx].pathmap + ": "+ liar_path_maps[idx].type);
  }

  ask_question("YesNo", "Is this correct? (y/n): ", function(ans){
    if(ans == "y"){
      console.log("OK Thank you"); 
    }
    else{
      ask_question("ChangeOption", "Type the number of the pathmap that you want to change type of: ", function(ans){
          var idx = ans;

          var i = 0;
          for(var type_idx in type_dict){
            var tp = type_dict[type_idx];
            console.log(type_idx + ": "+tp);
            i++;
          }
          ask_question("PickFromList", "Pick a type from the list above: ", function(ans){
            liar_path_maps[idx].type = ans;
            confirm("Renewed schema types are as follows: ");
          });
      });
    }
  })
}

function identify_field(path_name, _clb){
  if(path_name.indexOf(".") > -1){
    var path_namelst = path_name.split(".");
    path_name = path_namelst[path_namelst.length - 1];
  }
  for(var idx in supported_fieldnames){
    var field_name = supported_fieldnames[idx];
    if(path_name.indexOf(field_name) > -1 || path_name.indexOf(field_name.toUpperCase())  > -1){
      _clb(null, field_name);
      return;
    }
    else{
      var co_fields = correlated_fields[field_name];
      for(var idx2 in co_fields){
        if(path_name.indexOf(field_name) > -1 || path_name.indexOf(field_name.toUpperCase())  > -1){
          _clb(null, field_name);
          return;
        }   
      }
    }
  }

  _clb("NOT_FOUND", null);
  return;
}


function ask_question(ques_type, question, _clb){
  if(ques_type === "YesNo"){
    rl.question(question, function(ans){
      ans = ans.toString().trim();
      if(ans != "y" && ans != "n"){
        ask_question(ques_type, question, _clb);
      }
      else{
        _clb(ans);
      }
    });
  }
  else if(ques_type === "ChangeOption"){
    rl.question(question, function(ans){
      ans = ans.toString().trim();
      if(!liar_path_maps[ans]){
        ask_question(ques_type, question, _clb);
      }
      else{
        _clb(ans);
      }
    });
  }
  else if(ques_type === "PickFromList"){
    rl.question(question, function(ans){
      ans = ans.toString().trim();
      if(!type_dict[ans]){
        ask_question(ques_type, question, _clb);
      }
      else{
        _clb(ans);
      }
    });
  }

}


function create_path_maps(schema_paths){
  for(var path in schema_paths){
    if(arguments[1]){
      var pathmap = arguments[1];
      pathmap += "."+path;      
    }
    else{
      var pathmap = path;
    }
    var isNested = schema_paths[path].schema ? true : false;
    if(isNested){
      create_path_maps(schema_paths[path].schema.paths, pathmap);  
    } 
    else{
      liar_path_maps.push(pathmap);
    }   
  }
}

function clear_pathmaps(){
  for(var idx in liar_path_maps){
    var path = liar_path_maps[idx];
    if(path.indexOf("_id") > -1 || path.indexOf("__v") > -1){
      liar_path_maps.pop(idx);
    }
  }
}
/*
function convert_pathmaps(){
  for(var idx in liar_path_maps){
    var pathmap = liar_path_maps[idx];
    if(pathmap.indexOf(".") > -1){
      var pathmap_lst = pathmap.split(".");
      var root_path = pathmap_lst[0];
      pathmap_lst.pop(0);
      var temp_dict = {};
      temp_dict[root_path] = [];
      for(var idx2 in pathmap_lst){
        temp_dict[root_path].push({pathname: pathmap_lst[idx2]});
      }
      liar_paths.push(temp_dict);
    }
    else{
      var temp_dict = {pathname: pathmap};
      liar_paths.push(temp_dict);
    }
  }
}*/

function festival(_clb){
  var init_length = liar_path_maps.length;
  for(var idx in liar_path_maps){
    var pathmap = liar_path_maps[idx];
    identify_field(pathmap, function(err, result){
      if(err) console.log(err);
      else{
        liar_path_maps[idx] = {pathmap: pathmap, type: result};
      }
      if(idx == init_length-1){
        _clb(null, "OK");
      }
    });
  }
}

/*
function festival(){
  for(var idx in liar_paths){
    var path_obj = liar_paths[idx];
    console.log(path_obj);
    if(path_obj.pathname){
      identify_field(path_obj.pathname, function(err, result){
        if(err) console.log(err);
        else{
          ask_question("YesNo", 
                        path_obj.pathname+" is identified as "+result+" field. Proceed?(y/n): ", function(ans){
            if(ans == "y"){
              liar_paths[idx].type = result;
            }           
            else{
              //Pick from the list
            }
          });
        }
      }); 
    }
    else{
      for(var idx2 in path_obj){
        var path_obj_ch = path_obj[idx2];
        if()
      }
    }
    
  }
}
*/


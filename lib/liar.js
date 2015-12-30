#! /usr/bin/env node
/*
 * liar
 * https://github.com/mtndesign/liarjs
 *
 * Copyright (c) 2015 Metin Emenullahi
 * Licensed under the MIT license.
 */
var readline = require("readline");
var path = require('path');
var colors = require("colors");



var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/*
 *
 * COMMON 
 */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
/**********************/

var supported_fieldnames = ["id", "name", "address", "geo", "url", "text", "random word", "date", "url"];

var type_dict = {"id": "Is this path an id (I.e. 45678)?",
                 "name": "Is this path a name field (i.e John)?",
                 "middlename": "Is this path a middle name field (i.e Carl)?",
                 "surname": "Is this path a surname field (i.e Jackson)?",
                 "fullname": "Is this path a fullname field (i.e Gary Nick Scherzinger)?",
                 "username": "Is this path a username field (i.e nick90)?",
                 "url": "Is this path an any kind of url - site, permalink, media, documents and etc. (i.e http://google.com)?",
                 "siteurl": "Is this path a website url (i.e: mtndesign.net)?",
                 "mediaurl": "Is this path a media url field (i.e )?",
                 "date": "Is this path a date field (i.e 2013-04-15)?",
                 "datetime": "Is this path a datetime field (i.e 2012-05-23 14:03:56)?",
                 "time": "Is this path a time field (i.e 08:13:42)?"};

var correlated_fields = {"name": ["name", "surname", "fullname", "middlename", "username", "firstname", "lastname"],
                         "url": ["mediaurl", "siteurl"],
                         "date": ["date", "datetime", "time"]};

var arguments = process.argv.slice(2);
var SchemaPath = arguments[0];
SchemaPath = path.resolve(process.cwd(), SchemaPath);


var schema_model = require(SchemaPath);
var schema = schema_model.schema;
var schema_paths = schema.paths;
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
    confirm("Indentified schema types are as follows: ".green);
  }

});


function confirm(sentence){
  console.log(sentence);
  for(var idx in liar_path_maps){
    var can_change_to = correlated_fields[liar_path_maps[idx].type] ? correlated_fields[liar_path_maps[idx].type] : "";
    if(can_change_to != ""){
      console.log(idx.red +". "+liar_path_maps[idx].pathmap + ": "+ liar_path_maps[idx].type.yellow + "  | "+ "Or one of these: " + can_change_to.map(function(element){ return element.red;}));
    }
    else{
      console.log(idx.red +". "+liar_path_maps[idx].pathmap + ": "+ liar_path_maps[idx].type.yellow);
    }

  }

  ask_question("YesNo", "Is this correct?".green + "(y/n): ".red, function(ans){
    if(ans == "y"){
      ask_question("FloodOption", "How many fields do you want?".green+" (1, 10, 20, 50, 100): ".red, function(ans){
        start_flooding(ans);
      });
    }
    else{
      ask_question("ChangeOption", "Type the number of the pathmap that you want to change type of: ".green, function(ans){
          var idx = ans;

          /*var i = 0;
          for(var type_idx in correlated_fields[liar_path_maps[idx].type]){
            console.log(correlated_fields[liar_path_maps[idx].type][type_idx].red + " : " + type_dict[correlated_fields[liar_path_maps[idx].type][type_idx]].yellow);
            i++;
          }*/

          var i = 0;
          var new_type_dict = Object.keys(type_dict).map(function(element) {return element.indexOf(liar_path_maps[idx].type.toLowerCase()) > -1 ? element : ""; }); 
          for(var type_idx in new_type_dict){
            if(new_type_dict[type_idx] != "")
              console.log(new_type_dict[type_idx].red + " : "+ type_dict[new_type_dict[type_idx]].yellow);
          }

          console.log("Other".red + " : " + "Will display the whole list of supported types".yellow);
          ask_question("PickFromList", "Pick a type from the list above: ".green, function(ans){
            if(ans == "Other"){
              var i = 0;
              for(var type_idx in type_dict){
                var tp = type_dict[type_idx];
                console.log(type_idx.red + ": " + tp.yellow);
                i++;
              }
              ask_question("PickFromList", "Pick a type from the list above: ".green, function(ans){
                liar_path_maps[idx].type = ans;
                confirm("Renewed schema types are as follows: ".green);
              });

            }
            else{
              liar_path_maps[idx].type = ans;
              confirm("Renewed schema types are as follows: ".green);
            }
          });
      });
    }
  })
}


function start_flooding(flood_num){
  flood_num = parseInt(flood_num);
  for(var i=0; i< flood_num; i++){
    
  }
}

function identify_field(path_name, _clb){
  if(path_name.indexOf(".") > -1){
    var path_namelst = path_name.split(".");
    path_name = path_namelst[path_namelst.length - 1];
  }
  for(var idx in supported_fieldnames){
    var field_name = supported_fieldnames[idx];
    if(path_name.indexOf(field_name) > -1 || path_name.indexOf(field_name.toUpperCase())  > -1 || path_name.indexOf(field_name.capitalize()) > -1){
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

  _clb(path_name + " NOT_FOUND", null);
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
      if(!type_dict[ans] && ans != "Other"){
        ask_question(ques_type, question, _clb);
      }
      else{
        _clb(ans);
      }
    });
  }
  else if(ques_type === "FloodOption"){
    var flood_numbers = [1, 10, 20, 50, 100];
    rl.question(question, function(ans){
      if(!(ans in flood_numbers)){
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


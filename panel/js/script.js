//Global Data-Variable
var data;

$(document).ready(function(){
    getData(true);
});

function getData(start){
    var l_start = start || false;
    $.getJSON("../data.json",function(res){
        data = res;
        if(start == true) startBackbone();
        else if(start == false) location.reload();
    });
}

////Start Backbone Activities////
function startBackbone(){
    ////Goal Model////
    var m_goalModel = Backbone.Model.extend({
        defaults:{
            goal: "",
            event: "",
            date: "",
            finished: false,
            current: false
        }
    });
    
    var c_goalCollection = Backbone.Collection.extend({
        model: m_goalModel
    });
    
    ////Table View////
    var v_tableView = Backbone.View.extend({
        el: $("body"),
        
        events: {
            "click #submitBtn": "processNewData",
            "click .delBtn": "deleteEntry"
        },
        
        initialize: function(){
            _.bindAll(this, "render", "addGoal", "appendGoal", "processNewData");
            
            this.collection = new c_goalCollection();
            this.collection.bind("add",this.appendGoal);
            
            this.render();
        },

        render: function(){
            this.$el.empty();
            var self = this;
            
            //Create Header
            var header = '<h1 id="title">CUBING GOALS - CONTROL PANEL</h1>';
            $("body").append(header);
            
            //Create Table
            var table = '<table id="goalTable" class="table table-bordered"></table>';
            $("body").append(table);
            
            //Create Table Head
            var header = ["Del","Goal", "Event", "Date", "Finished", "Current Target"];
            var tableHead = "<thead><tr>";
            for(i in header)
                tableHead += "<th>"+header[i]+"</th>"
            tableHead += "</tr></thead>";
            $('#goalTable').append(tableHead);
            
            //Create Table Body
            var tableBody = "<tbody></tbody>";
            $('#goalTable').append(tableBody);
            
            _(this.collection.models).each(function(goal){
                self.appendGoal(goal);
            },alert);
            
            //Create new void model to add
            self.appendVoidGoal();
            
            //Create Submit Button
            var submitBtn = "<div id='submitBtnContainer'><input type='button' class='btn btn-lg btn-primary' id='submitBtn' value='Submit' /></div>";
            $("body").append(submitBtn);
            
        },
        
        addGoal: function(p_goal, p_event, p_date, p_finished, p_current){
            var goal = new m_goalModel();
            goal.set({
                goal: p_goal,
                event: p_event,
                date: p_date,
                finished: p_finished,
                current: p_current
            });
            this.collection.add(goal);
        },
        
        appendGoal: function(goal){
            var newtr = "<tr>";
            
            newtr += "<td><input type='button' class='btn btn-sm btn-danger delBtn' value='X' /></td>";
            newtr += "<td class='td_goal'><input type='text' value='"+goal.get("goal")+"'/></td>";
            switch(goal.get("event")){
                case "2x2x2":
                    newtr += "<td class='td_2x2x2'><input type='text' value='"+goal.get("event")+"'/></td>";
                    break;
                    
                case "3x3x3":
                    newtr += "<td class='td_3x3x3'><input type='text' value='"+goal.get("event")+"'/></td>";
                    break;
                    
                case "3x3x3 OH":
                    newtr += "<td class='td_3x3x3OH'><input type='text' value='"+goal.get("event")+"'/></td>";
                    break;
                    
                case "4x4x4":
                    newtr += "<td class='td_4x4x4'><input type='text' value='"+goal.get("event")+"'/></td>";
                    break;
                    
                case "Pyraminx":
                    newtr += "<td class='td_pyraminx'><input type='text' value='"+goal.get("event")+"'/></td>";
                    break;
                    
                default:
                    newtr += "<td><input type='text' value='"+goal.get("event")+"'/></td>";
                    break;
            }        
            newtr += "<td><input type='text' value='"+goal.get("date")+"'/></td>";
            newtr += goal.get("finished")=="true"?"<td><input type='checkbox' value='ch_finished' checked></td>":"<td><input type='checkbox' value='ch_finished'></td>";
            newtr += goal.get("current")=="true"?"<td><input type='checkbox' value='ch_current' checked></td>":"<td><input type='checkbox' value='ch_current'></td>";
            newtr += "</tr>";
            $("tbody",this.el).append(newtr);
        },
        
        appendVoidGoal: function(){
            var newtr = "<tr id='voidTR'>";
            newtr += "<td></td>";
            newtr += "<td class='td_goal'><input type='text'/></td>";
            newtr += "<td><input type='text'/></td>";
            newtr += "<td><input type='text'/></td>";
            newtr += "<td><input type='checkbox' value='ch_finished'></td>";
            newtr += "<td><input type='checkbox' value='ch_current'></td>";
            newtr += "</tr>";
            $("tbody",this.el).append(newtr);
        },
        
        deleteEntry: function(el){
            $(el.currentTarget).parent().parent().remove();
            this.processNewData();
        },
        
        processNewData: function(){
            //Local Variables
            var self = this;
            var table = $("#goalTable");
            var numAttr = Object.keys(self.collection.models[0].attributes);
            var counter = 0;
            var strObj = '{"timeGoals" : [';
            
            //Get Data from Form and create a JSON Object
            table.each(function(){
                $(this).find("tbody").each(function(){    
                    $(this).find("tr").each(function(){
                        if($(this).attr("id") == "voidTR" && $(this).children(".td_goal").children("input").val()==""){
                            return;
                        }
                        strObj += "{";
                        $(this).find("td").each(function(){
                            counter++;
                            $(this).children().each(function(){
                                if($(this).attr("type") == "button"){
                                    counter -= 1;
                                }
                                else{                                
                                    if($(this).is(":checkbox"))
                                        var val = $(this).prop("checked");
                                    else
                                        var val = this.value;
                                    strObj += '"'+numAttr[counter-1]+'":"'+val+'",';
                                }
                            });
                        });
                        strObj = strObj.slice(0,-1);
                        strObj += "},";
                        counter=0;
                    });
                });                
            });
            strObj = strObj.slice(0,-1);
            strObj += "]}";
            
            var jsonObj = JSON.parse(strObj);
            
            //Write new jsonObj to Data-File via PHP-Script
            $.ajax({
                url: "php/handleDataFile.php",
                type: "POST",
                data: {jsonData: strObj},
                dataType: "text",
                success: function(data, status){$
                    console.log("successfully transmitted data");
                    getData(false);
                    self.appendVoidGoal();
                },
                error: function(data, err, wut){
                    console.error("data: " + JSON.stringify(data) + " || ERROR: " + err + " || wut: " + wut);
                }
            });
        },
    });
        
    ////Running Code////
    
    //Create a new Table View
    var tableView = new v_tableView();

    //Add models from DB
    var timeGoals = data.timeGoals;
    for(i in timeGoals){
        var d_goal = timeGoals[i].goal;
        var d_event = timeGoals[i].event;
        var d_date = timeGoals[i].date;
        var d_finished = timeGoals[i].finished;
        var d_current = timeGoals[i].current;

        tableView.addGoal(d_goal, d_event, d_date, d_finished, d_current);
    }
}
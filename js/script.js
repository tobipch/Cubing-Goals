$(document).ready(function(){
    var data;
    
    $.getJSON("data.json",function(res){
        data = res;
        startBackbone(data);
    });
});

function startBackbone(data){
    ////Goal Model////
    var m_goalModel = Backbone.Model.extend({
        defaults:{
            goal: "goal",
            event: "event",
            date: "date",
            finished: false,
            p_current: false
        }
    });
    
    var c_goalCollection = Backbone.Collection.extend({
        model: m_goalModel
    });
    
    ////Table View////
    var v_tableView = Backbone.View.extend({
        el: $("#goalTable"),

        initialize: function(){
            _.bindAll(this, "render", "addGoal", "appendGoal");
            
            this.collection = new c_goalCollection();
            this.collection.bind("add",this.appendGoal);
            
            this.render();
        },

        render: function(){
            var self = this;
            
            //Create Table Head
            var header = ["Goal", "Event", "Date", "Finished", "Current Target"];
            var tableHead = "<thead><tr>";
            for(i in header)
                tableHead += "<th>"+header[i]+"</th>"
            tableHead += "</tr></thead>";
            $(this.el).append(tableHead);
            
            //Create Table Body
            var tableBody = "<tbody></tbody>";
            $(this.el).append(tableBody);
            
            _(this.collection.models).each(function(goal){
                self.appendGoal(goal);
            },this);
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
            
            newtr += "<td class='td_goal'>"+goal.get("goal")+"</td>";
            switch(goal.get("event")){
                case "2x2x2":
                    newtr += "<td class='td_2x2x2'>"+goal.get("event")+"</td>";
                    break;
                    
                case "3x3x3":
                    newtr += "<td class='td_3x3x3'>"+goal.get("event")+"</td>";
                    break;
                    
                case "3x3x3 OH":
                    newtr += "<td class='td_3x3x3OH'>"+goal.get("event")+"</td>";
                    break;
                    
                case "4x4x4":
                    newtr += "<td class='td_4x4x4'>"+goal.get("event")+"</td>";
                    break;
                    
                case "Pyraminx":
                    newtr += "<td class='td_pyraminx'>"+goal.get("event")+"</td>";
                    break;
                    
                default:
                    newtr += "<td>"+goal.get("event")+"</td>";
                    break;
            }        
            newtr += "<td>"+goal.get("date")+"</td>";
            newtr += goal.get("finished")?"<td><img src='assets/images/check.png' /></td>":"<td><img src='assets/images/cross.png' /></td>";
            newtr += goal.get("current")?"<td><img src='assets/images/check.png' /></td>":"<td><img src='assets/images/cross.png' /></td>";
            newtr += "</tr>";
            $("tbody",this.el).append(newtr);
        }
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
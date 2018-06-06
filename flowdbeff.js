var scriptstart=false;
loadSQLScript(function(){scriptstart=true});

var flowdbeffdiv=null;
var AScreens = [];
var ADesigns = [];
var AScreenType=[[0,"Browse list"],[1,"Edit form"]];
var AScreenSource=[[0,"Table"],[1,"Custom SQL"]];
var ADesignTypes=[[0,"1p"],[1,"2pv"],[2,"2pf"],[3,"3pv"],[4,"3pf"],[5,"4p"],[6,"6pv"],[7,"6pf"]];

//region INITIALIZE and SQL functions

function flowdbeff(button){
    if (flowdbeffdiv==null){        
        var mainarea=document.getElementById("mainarea");
        flowdbeffdiv = document.createElement("div");
        flowdbeffdiv.className="row";
        flowdbeffdiv.id="flowdbeff";
        mainarea.appendChild(flowdbeffdiv);
        flowdbeffdiv.innerHTML=`<nav id="effmenu" > </nav><div id="effarea"></div><div id="efflist"></div>`;
        var effmenu=document.getElementById("effmenu");
        var s = `<button onclick='{document.getElementById("flowdbeff").style.display="none"; document.getElementById("area").style.display="flex";}'>FlowDBEditor</button>`;
        s += `<button onclick=''>Screens</button>`;
        s += `<button onclick=''>Designs</button>`;
        s += `<button onclick=''>Create files</button>`;
        effmenu.innerHTML=s;
    } 
    flowdbeffdiv.style.display="inline";    
    var effarea=document.getElementById("effarea");
    effarea.innerHTML="";        
    init(effarea);
    document.getElementById("area").style.display="none";
}

function loadSQLScript(fuggv){
    var script = document.createElement('script');
    script.onload = fuggv;
    script.src = "https://kripken.github.io/sql.js/js/sql.js";
    document.head.appendChild(script);     
}
function init(div){
    if (ATables.length<1) return;    
    var panel="";
    panel+= effComboBoxDOM("efftable","Table",(function(){
            var s=[];
            for (let i = 0; i < ATables.length; i++) {
                const t = ATables[i];
                s.push([i,t.name]);
            }                
            return s;
        })()
    ,-1);
    panel+=effComboBoxDOM("effsqltype","Type",AScreenType,-1);
    panel+=effComboBoxDOM("effsqlsource","Source",AScreenSource,-1);
    panel+="<button onclick='addScreen(this)'>Add</button><hr style='border:1px black solid;'>";
    div.innerHTML=panel;
}

var C_cover="`";
function generateSQL(table) {  
    return generateSQLwithConstraintsText(table,", ","");  
    //simple: return "select "+getTableFields(table,false)+" from "+C_cover+table.name+C_cover;
}


function generateSQLwithConstraintsText(table,separatechar=", ",cover=C_cover){
    var t = generateSQLwithConstraints(table);
    var s="select ";
    for (let i = 0; i < t[0].length; i++) {
        const e = t[0][i];
        s+=cover+e+cover+separatechar;
    }
    if (t[0].length>0){
        s = s.substr(0,s.length-separatechar.length);        
    }
    s+=" from ";
    for (let i = 0; i < t[2].length; i++) {
        const e = t[2][i];
        s+=cover+e+cover+separatechar;
    }
    if (t[2].length>0){
        s = s.substr(0,s.length-separatechar.length);        
    }
    s+=" where ";
    for (let i = 0; i < t[1].length; i++) {
        const e = t[1][i];
        s+=e[0]+"."+e[1]+"="+e[2]+"."+e[3]+" and ";
    }
    if (t[1].length>0){
        s = s.substr(0,s.length-(" and ").length);        
    }
    return s;
}

SQLLevel=0;
function generateSQLwithConstraints(table){
    var level="F"+(SQLLevel++);    
    //var level1="F"+(SQLLevel);    
    var select = getTableFields(table,true,"","",level); //toArray
    var where=[];
    var from=[table.name+" "+level];
    var links=table.getLinksTo();
    var aktlevel=SQLLevel;
    var diff=0;
    for (let i = 0; i < links.length; i++) {
        const l = links[i];
        if (l.table.name!=l.link.table.name){
            //where.push([l.table.name+" "+level,l.name,l.link.table.name+" "+level1,l.link.name]);
            where.push([level,l.name,"F"+(aktlevel+i+diff),l.link.name]);
            //from.push(l.link.table.name);
            var diff=SQLLevel;
            res=generateSQLwithConstraints(l.link.table);
            var diff = SQLLevel-diff-1;
            select = select.concat(res[0]);
            where = where.concat(res[1]);                
            from = from.concat(res[2]);                      
        }      
    }
    return [select,where,from];
}

// get table to array ( if separatechar is empty ) or string
function getTableFields(table,displayonly=false,separatechar=", ",cover=C_cover,prefix="") { // default 
    cnt = table.AFields.length;
    var s="";
    var t=[];
    for (let i = 0; i < table.AFields.length; i++) {
        const f = table.AFields[i];
        if ((!displayonly) || ((displayonly)&& (f.display))){
            if (separatechar=="")
                t.push(prefix+"."+f.name)
            else 
                s+=cover+f.name+cover+separatechar;
        }
    }
    if (s.length>0){
        s = s.substr(0,s.length-separatechar.length);        
    }
    if (separatechar=="")
        return t;
    else
        return s;
}

function effComboBoxDOM(id,label,values,selected) { //p1: [ [0,"users"],[1,"persons"],.... ]
                                        //p2: 5
    if (values.length<1) return "";
    var opt = `<label>`+label+`</label><select id="`+id+`">`;
    for (let i = 0; i < values.length; i++) {
        const v = values[i];
        opt+=`<option `;
        if (v[0]==selected) {
            opt+=`selected `;
        }
        opt+=`value="`+v[0]+`">`+v[1]+`</option>`;
    }
    return (opt+=`</select>`);
  }

  function createTableScreen(div){
    div.innerHTML=`<td>`+div.table.name+`</td><td>
        <div><input type="checkbox">Browse list</div>
        <div><input type="checkbox">Edit form</div></td>
        <td style="width:70%;"><div><input type="checkbox" onchange="generateSQL(this)"><textarea style="width:90%" placeholder="Generated SQL"></textarea></div></td>
        </td>`;
    //todo constraints    
}

function addScreen(button){
    var s = new TScreen();
    s.type = document.getElementById("effsqltype").value;
    s.source = document.getElementById("effsqlsource").value;
    s.table = ATables[document.getElementById("efftable").value];
    AScreens.push(s);
    refreshScreenList();
}

function refreshScreenList(){
    var efflist=document.getElementById("efflist");
    efflist.innerHTML="";
    for (let i = 0; i < AScreens.length; i++) {
        const sc = AScreens[i];
        efflist.appendChild(sc.getListDOM());
        efflist.appendChild(document.createElement("hr"));
    }
}

//endregion INIT
//region Eff functions

TScreen = function(){
    this.enable=true;
    this.type=0;
    this.source=0;
    this.sql="";
    this.table=null;

    this.getListDOM = function(){
        div=document.createElement("div");
        div.screen=this;
        s="<span><input type='checkbox' checked></span><span><span>From "+AScreenSource[this.source][1]+"</span> ";
        s+="<span>"+AScreenType[this.type][1]+"</span><br>";
        if (this.source==1){
            s+="<textarea style='width:80%;' placeholder='SQL Expression'>"+generateSQL(this.table)+"</textarea>";
        } else {
            s+="<div>"+this.table.name+"</div>";
        }
        div.innerHTML=s+"</span>";
        return div;
    }
}


TDesign = function(typeindex,screensarray){
    AScreens = [];  //used screens pl.     1,4,3 / 3pf
    DesignType = 0; //ADesignTypesIndex            4

    // 4,[1,4,3]
    this.DesignType=typeindex;
    this.AScreens=screensarray;
    
}





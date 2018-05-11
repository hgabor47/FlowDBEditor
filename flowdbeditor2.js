var g = document.getElementsByName("table");
var flowdbeditor = document.getElementById("flowdbeditor");

for (let i = 0; i < g.length; i++) {
  const obj = g[i];
  obj.setAttribute("transform","translate(100,100)");
  obj.addEventListener("mousedown",down);
  obj.addEventListener("mousemove",move);
  obj.addEventListener("mouseup",up);
}


var noSelectedStyle = "fill:grey;stroke:black;stroke-width:1;opacity:0.5";
var selectedStyle = "fill:blue;stroke:#000099;stroke-width:3;opacity:0.4";
var fieldRowHeight = convertRemToPixels(1);//rem
var fieldRowPadding = fieldRowHeight/2;
var stateEdit = false;
var constraintList = true; //The list of record contain field values from another linked table

//#region HINTS
var oncehints = [];
oncehints.NewLinkFromPanel="Please select an another field name.";
oncehints.NewLink="Please select first a field name and after click an another field name.";
oncehints.outside="Reposition missed tables.";
oncehints.save="Save to browsers' local storage.\nIn the next time you can load this.";
oncehints.load="Load latest stored database from localstorage.";
oncehints.hint = function(hint){
  if (oncehints[hint]!=""){
    alert(oncehints[hint]);
    oncehints[hint]="";
  }
}

//#endregion HINTS

var idTable=0;
var TTable = function(name){  
  this.posxy=[100,100]; //in px  
  this.width=200;
  this.height=200;
  this.AFields = []; //Tfield  
  this.Records = [];  //realtime upfill
  this.DOMGroup=null; //teljese Table
    this.DOMtitle=null;
    this.DOMrect=null;
    this.DOMFieldsGroup=null; //fields    
  this.setName=function(name){
    this.name=name;
    if (this.DOMtitle!=null) 
      this.DOMtitle.innerHTML=name;
  }
  this.setName(name+(idTable++));
  this.addField = function(name,type){
    f = new TField(this,name);    
    f.type=type;
    this.AFields.push(f);
  }
  this.setPosXY=function(x,y){
    this.posxy[0]=x;
    this.posxy[1]=y;
  }
  this.getDOM=function(){
    this.DOMGroup=document.createElementNS("http://www.w3.org/2000/svg","g");
    this.DOMGroup.table=this;
    this.DOMrect=document.createElementNS("http://www.w3.org/2000/svg","rect");
    this.DOMrect.setAttribute("name","table");
    //this.DOMrect.setAttribute("x",this.posxy[0]);
    //this.DOMrect.setAttribute("y",this.posxy[1]);
    this.DOMrect.setAttribute("rx",7);
    this.DOMrect.setAttribute("ry",7);
    this.DOMrect.setAttribute("width",this.width);
    this.DOMrect.setAttribute("height",this.height);
    this.DOMrect.setAttribute("style",noSelectedStyle);    
    this.DOMGroup.addEventListener("contextmenu",contextmenu);
    this.DOMGroup.addEventListener("mousedown",down);
    this.DOMGroup.addEventListener("touchstart",down);
    this.DOMGroup.addEventListener("mousemove",move);
    this.DOMGroup.addEventListener("touchmove",touchmove);
    this.DOMGroup.addEventListener("mouseup",up);
    this.DOMGroup.setAttribute("transform","translate("+this.posxy[0]+","+this.posxy[1]+")");
    this.DOMtitle = document.createElementNS("http://www.w3.org/2000/svg","text");      
    this.DOMtitle.setAttribute("transform","translate(5,"+fieldRowHeight+")");
    this.DOMtitle.table=this; 
    this.DOMtitle.setAttribute("class","flow_tables") ; 
    this.DOMtitle.addEventListener("mousedown",titleClick);
    this.DOMFieldsGroup=document.createElementNS("http://www.w3.org/2000/svg","g");       
    this.DOMFieldsGroup.setAttribute("transform","translate(3,32)"); 
    
    
    
    this.DOMGroup.appendChild(this.DOMrect);
    this.DOMGroup.appendChild(this.DOMtitle);
    this.DOMGroup.appendChild(this.DOMFieldsGroup);
    
    this.refreshDOM();
    return this.DOMGroup;
  }
  this.refreshDOM=function(){
    this.setName(this.name);
    this.DOMrect.setAttribute("width",this.width);
    this.DOMrect.setAttribute("height",this.height);
    this.DOMGroup.setAttribute("transform","translate("+this.posxy[0]+","+this.posxy[1]+")");
    this.refreshFields();
  }

  this.refreshFields=function(){
    var el=this.DOMFieldsGroup;    
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    var a = this.AFields;
    const fleft=[5,this.width*0.4,this.width*0.8];
    for (let i = 0; i < a.length; i++) {
      const e = a[i];
      
      var fi = document.createElementNS("http://www.w3.org/2000/svg","text");       
      fi.setAttribute("transform","translate("+fleft[0]+","+((i*fieldRowHeight)+fieldRowPadding)+")");
      fi.addEventListener("mousedown",fieldClick);
      fi.setAttribute("class","flow_fields")  ;
      var fi2 = document.createElementNS("http://www.w3.org/2000/svg","text");       
      fi2.setAttribute("transform","translate("+fleft[1]+","+((i*fieldRowHeight)+fieldRowPadding)+")");      
      fi2.setAttribute("class","flow_fields_noevent")  ;
      var fi3 = document.createElementNS("http://www.w3.org/2000/svg","text");       
      fi3.setAttribute("transform","translate("+fleft[2]+","+((i*fieldRowHeight)+fieldRowPadding)+")");      
      fi3.setAttribute("class","flow_fields_noevent")  ;
      fi.fi2=fi2;
      fi.fi3=fi3;  
      
      var fib = document.createElementNS("http://www.w3.org/2000/svg","rect");       
      fib.setAttribute("x", 0);
      fib.setAttribute("y", (((i-1)*fieldRowHeight)+fieldRowPadding));
      fib.setAttribute("width", this.width-6);
      fib.setAttribute("height", fieldRowHeight);  
          
      if (i%2==0)
        fib.setAttribute("class","flow_fields_color3")       
      else
        fib.setAttribute("class","flow_fields_color4") ;      
      fi.field=e;
      e.DOMElement=fi;
      e.posrow=i;
      fi.innerHTML=e.name;
      fi2.innerHTML=AType.SearchTypeById(e.type).name;
      fi3.innerHTML=e.length;
      
      el.appendChild(fib);    
      el.appendChild(fi); 
      el.appendChild(fi2); 
      el.appendChild(fi3); 
    }
    this.refreshConstraints();
  }

  this.refreshConstraints=function(){
    var a = this.AFields;
    var tmptables=[];

    for (let i = 0; i < a.length; i++) {
      const e = a[i];
      var t=e.refreshLink();
      if (t!=null){
        tmptables.push(t);
      }
    }
    //reverse refresh
    for (let i = 0; i < ATables.length; i++) {
      const t = ATables[i];
      var chk = (tmptables.indexOf(t)>-1);

      if (t!=this && chk!=true){
        for (let j = 0; j < t.AFields.length; j++) {
          const f = t.AFields[j];
          if (f.link!=null){
            if (f.link.table==this){
              f.refreshLink();
              //f.table.refreshConstraints();
            }
          }
        }      
      }
    }
  }

  this.refreshRecordFields=function(){ //if the fields are change
    if (this.Records.length<2) return;
    var table = this;
    table.AFields.forEach(function(o,i){
      table.Records[0][i]=o.name;
    })
  }

  this.Selected=function(){
    SelectedTable=this;
    this.DOMrect.setAttribute("style",selectedStyle);
    refreshFieldsList();
  }
  this.noSelected=function(){
    SelectedTable=this;
    this.DOMrect.setAttribute("style",noSelectedStyle);
    refreshFieldsList();
  }

  this.edit=function(parent){
    if (stateEdit) return;
    stateEdit=true;
    var div = document.createElement("div");
    div.className="flow_edit";
    div.innerHTML=
    `<label>Tablename</label><input type="text" id="edit_name" value="`+this.name+`"><br>
     <label>Width</label><input type="number" id="edit_width" value="`+this.width+`"><br>
     <label>Height</label><input type="number" id="edit_height" value="`+this.height+`"><br>
     <button onclick="editTableOK(this)">OK</button>
     <button onclick="editTableCancel(this)">Cancel</button>
     <button onclick="editTableDelete(this)">Delete</button>
     `;
    div.table=this;
    parent.appendChild(div);
    return div;
  }

  this.browse=function (parent) {
    if (stateEdit) return;
    stateEdit=true;
    var div = document.createElement("div");
    div.className="flow_edit";
    div.setAttribute("id","list")
    parent.appendChild(div);

    list( ATables.indexOf(this),"list");

    div.table=this;
    
    return div;
  }


  this.destroy = function(){
    var linksto=this.getLinksTo();
    var linksfrom=this.getLinksFrom();
    linksto.forEach(function(fields,i){
      fields.deleteLink();      
    });
    linksfrom.forEach(function(fields,i){
      fields.deleteLink();      
    });

    AFields=[];
    Records=[];
    if (this !=null && this.DOMGroup!=null)
      flowdbeditor.removeChild(this.DOMGroup);
    /*for (let i = 0; i < AFields.length; i++) {
      const f = AFields[i];
      f.Clear();
    }*/
  }

  this.getXML = function(xml,root){
    var t = xml.createElement("table");root.appendChild(t);    
    t.setAttribute("name",this.name);
    t.setAttribute("posxy",this.posxy);
    t.setAttribute("width",this.width);
    t.setAttribute("height",this.height);
    for (let i = 0; i < this.AFields.length; i++) {
      const f = this.AFields[i];
      f.getXML(xml,t);
    }
    var rec = xml.createElement("records");t.appendChild(rec);
    this.Records.forEach(function(item,index){
      var row = xml.createElement("row");rec.appendChild(row);
      item.forEach(function(cols,idx){
        var col = xml.createElement("col");row.appendChild(col);
        col.innerHTML=cols;
      })
    });

  }
  this.setFromXML = function(node){
    this.name=node.getAttribute("name");
    this.posxy=node.getAttribute("posxy").split(",");
    for (let i = 0; i < this.posxy.length; i++) {
      const p = Number(this.posxy[i]);
      this.posxy[i]=p;
    }
    this.width=Number(node.getAttribute("width"));
    this.height=Number(node.getAttribute("height"));
    var xmlfields = node.getElementsByTagName("field");
    for (let i = 0; i < xmlfields.length; i++) {
      const xmlfield = xmlfields[i];
      var f = new TField(this,"fieldx");      
      f.setFromXML(xmlfield);
      this.AFields.push(f);
    }

    var rec = node.getElementsByTagName("records");
    if (rec!=null) 
      rec = rec[0];
    
    var row = rec.getElementsByTagName("row");
    this.Records=[];
    Rec=this.Records;
    Array.prototype.forEach.call(row,function(r,ridx){
      var col = r.getElementsByTagName("col");
      var bc=[];
      Array.prototype.forEach.call(col,function(c,cidx){
        //cols
        bc.push(c.innerHTML);
      });
      Rec.push(bc);
    });
    
    

  }
  this.setLinksFromTemp = function(){    
    for (let i = 0; i < this.AFields.length; i++) {
      const f = this.AFields[i];      
      f.setLinksFromTemp();
    }
  }
  this.SearchFieldByName=function(fieldname){
    const result = this.find( fi => fi.name === fieldname );
    return result
  }
  this.getLinksTo=function(){ //result fields[]
    res=[];
    if (this.AFields!=null){
      this.AFields.forEach(function(field,index){
        if (field!=null && field.link!=null){
          res.push(field);
        }
      });
    }
    return res;
  }
  this.getLinksFrom=function(){ //result fields[]
    var res=[];
    const Table=this;
    if (ATables!=null){
      ATables.forEach(function(table,index){
        if (table!=null && table.AFields!=null){
          table.AFields.forEach(function(field,index2){
            if (field!=null && field.link!=null){
              if (field.link.table==Table)
                res.push(field);
            }
          });
        }
      });
    }
    return res;
  }


  this.AFields.SearchFieldByName=this.SearchFieldByName;
}
var idField = 0;

var TField = function(table,name){
  
  this.type=0;  //TType
  this.length=0;
  this.link=null; //null or TField constraint
  this.table=table; //TTable parent
  this.posrow=0;   //row 0,1,2,3...  
  this.DOMElement=null;  //to svg text
  this.DOMLink=null;  //Line to another field
  this.name=name;
  this.autoinc=1;


  this.edit=function(parent){
    if (stateEdit) return;
    stateEdit=true;
    var div = document.createElement("div");
    div.className="flow_edit";    
    div.style.top=Number(this.table.posxy[1]+20)+"px";
    div.style.left=Number(this.table.posxy[0]-30)+"px";
    div.innerHTML=`<label>Fieldname</label><input type="text" id="edit_name" value="`+this.name+`"><br>`;
    var opt = `<label>Fieldtype</label><select id="edit_type">`;
    for (let i = 0; i < AType.length; i++) {
      const at = AType[i];
      if (this.type==at.id){
        opt+=`<option selected value="`+at.id+`">`+at.name+`</option>`;  
      }else {
        opt+=`<option value="`+at.id+`">`+at.name+`</option>`;  
      }
    }     
    div.innerHTML+=opt+`</select><br>
     <label>Length</label>
     <input type="number" id="edit_length" value="`+this.length+`">
     <hr>
     <button onclick="editFieldDelete(this)">Delete Field</button>
     <hr><label>Data from another table:</label>
     <button onclick="editFieldLink(this)">LinkTo</button>
     <button onclick="editFieldLinkDelete(this)">DeleteLink</button>
     <hr>
     <button onclick="editFieldOK(this)">OK</button>
     <button onclick="editFieldCancel(this)">Cancel</button>
     `;
    div.field=this;
    parent.appendChild(div);
    return div;
  }
  this.addLink=function(field){
    this.link = field;    
    this.DOMLink =document.createElementNS("http://www.w3.org/2000/svg","line");
    this.DOMLink.setAttribute("x1",100);
    this.DOMLink.setAttribute("y1",100);
    this.DOMLink.setAttribute("x2",300);
    this.DOMLink.setAttribute("y2",200);
    this.DOMLink.setAttribute("class","flow_line");

    var k =document.createElementNS("http://www.w3.org/2000/svg","line");
    k.setAttribute("x1",100);
    k.setAttribute("y1",100);
    k.setAttribute("x2",300);
    k.setAttribute("y2",200);
    k.setAttribute("class","flow_line_start");
    this.DOMLink.k=k;
    var v =document.createElementNS("http://www.w3.org/2000/svg","line");
    v.setAttribute("x1",100);
    v.setAttribute("y1",100);
    v.setAttribute("x2",300);
    v.setAttribute("y2",200);
    v.setAttribute("class","flow_line_end");
    this.DOMLink.v=v;
    flowdbeditor.appendChild(this.DOMLink.v);
    flowdbeditor.appendChild(this.DOMLink.k);
    flowdbeditor.appendChild(this.DOMLink);
    
  
    this.refreshLink();
  }
  this.deleteLink=function(){
    if(this.link!=null){
      if (this.DOMLink!=null){
        if (this.DOMLink.v!=null)
          flowdbeditor.removeChild(this.DOMLink.v);
        if (this.DOMLink.k!=null)          
          flowdbeditor.removeChild(this.DOMLink.k);
        flowdbeditor.removeChild(this.DOMLink);
        this.DOMLink=null;
        this.link=null;
      }
    }
  } 
  this.refreshLink=function(){
    if (this.DOMLink!=null){
      if (this.link!=null){
        a=this.getPosXY();
        b=this.link.getPosXY();
        this.DOMLink.setAttribute("x1",a[0]-16);
        this.DOMLink.setAttribute("y1",a[1]);
        this.DOMLink.setAttribute("x2",b[0]+this.link.table.width);
        this.DOMLink.setAttribute("y2",b[1]);

        this.DOMLink.k.setAttribute("x1",a[0]-16);
        this.DOMLink.k.setAttribute("y1",a[1]);
        this.DOMLink.k.setAttribute("x2",a[0]);
        this.DOMLink.k.setAttribute("y2",a[1]);

        this.DOMLink.v.setAttribute("x1",b[0]+this.link.table.width);
        this.DOMLink.v.setAttribute("y1",b[1]-8);
        this.DOMLink.v.setAttribute("x2",b[0]+this.link.table.width);
        this.DOMLink.v.setAttribute("y2",b[1]+8);
        
        return this.link.table;
      }
    }
  }
  this.getPosXY=function(){  
    //var t = this.table.DOMGroup.getAttribute("transform"); //Late!
    //var o1 = tool_getTransform(t);
    var o1=[0,0];
    o1[0]=this.table.posxy[0];
    o1[1]=this.table.posxy[1];
    o1[1]+=(this.posrow*fieldRowHeight)+fieldRowPadding+fieldRowHeight+(fieldRowHeight/2);//title is
    return [o1[0],o1[1]];
    //Table  
    //return [this.table.posxy[0],this.table.posxy[1]];
  }
  this.getXML = function(xml,root){
    var f = xml.createElement("field");root.appendChild(f);    
    f.setAttribute("name",this.name);
    f.setAttribute("type",this.type);
    f.setAttribute("length",this.length);
    if (this.link!=null){
      f.setAttribute("link",[this.link.table.name,this.link.name]);
    }    
    f.setAttribute("autoinc",[this.autoinc]);
  }
  this.setFromXML = function(node){
    this.name=node.getAttribute("name");
    this.type=Number(node.getAttribute("type"));
    this.length=Number(node.getAttribute("length")); 
    this.linktext = node.getAttribute("link");
    this.autoinc = node.getAttribute("autoinc");
    if (this.linktext!=null){
      this.linktext=this.linktext.split(",");
    }
  }
  this.setLinksFromTemp = function(){
    if (this.linktext!=null){
      tablename=this.linktext[0];
      fieldname=this.linktext[1];
      //TODO: search table and field and create constraints
      var t = ATables.SearchTableByName(tablename);
      var f = t.AFields.SearchFieldByName(fieldname);
      //this.link=f;
      this.addLink(f);
    }    
  }
  this.destroy = function(){
    var index = this.table.AFields.indexOf(this);
    if (index>-1){
      if (this.link!=null){
        this.deleteLink();
      }
      var linksfrom = this.table.getLinksFrom();
      linksfrom.forEach(function(fields,i){
        if (fields==this)
          fields.deleteLink();      
      });
      this.table.AFields.splice(index, 1);
      this.table.refreshFields();
      refreshFieldsList();

    }
  }

  this.toString=function(){
    return this.name+" "+AType.SearchTypeById(this.type).name+" "+this.length;
  }
}

TLink = function() { //aka constraint

}

var idTtype=0;
var TType = function(name,sql,inputtype){
  this.id=idTtype++;
  this.name=name;
  this.sql=sql;
  this.inputtype=inputtype;
}


//#region Arrays -----------------------------
var FlowModes = Object.freeze({"Flow":1, "Constraint":2})

var AType = [new TType("String","varchar(%)","text"),
       new TType("Integer","int(11)","number"),
       new TType("Float","Float","number"),
       new TType("Autoinc","int(11) not null","number"),
       new TType("Date","date","date"),
       new TType("DateTime","datetime","datetime-local"),
       new TType("Time","time","time"),
       new TType("Bool","tinyint","checkbox"),
       new TType("Text","text","text"),
       new TType("Image","mediumblob",'<img src="%0">'),
       new TType("URL","varchar(200)",'<a href="%0">%1</a>'),
       new TType("VideoLink","varchar(200)",'<a href="%0">%1</a>')];
SearchTypeById = function(id){
  const result = AType.find( tab => tab.id === id );
  return result;
}
AType.SearchTypeById=SearchTypeById;

var SelectedTable = null;
var flowMode = FlowModes.Flow;
var SelectedField = null;//not used
var constraintField =null; //starting field

var ATables = [];
SearchTableByName = function(tablename){
  const result = ATables.find( tab => tab.name === tablename );
  return result;
}
ATablesclear=function(){
  for (let i = 0; i < ATables.length; i++) {
    const t = ATables[i];
    if (t!=null)
      t.destroy();
  }
  ATables = [];ATables.clear=ATablesclear; 
  ATables.SearchTableByName=SearchTableByName;
}
ATables.clear=ATablesclear;
ATables.SearchTableByName=SearchTableByName;

//#endregion Arrays

//#region HIGH

function sortTables(){
  oncehints.hint("outside");
  if (ATables!=null){
    ATables.forEach(function(table,idx){
      var ok=true;
      if (table.posxy[0]<0) {table.posxy[0]=100;ok=false;}
      if (table.posxy[1]<0) {table.posxy[1]=100;ok=false;}
      if (!ok){
        table.refreshDOM();
      }
    });    
  }
}

function newTable(){
  var t = new TTable("Unknown");
  t.addField("id",3); //autoinc
  ATables.push(t);
  flowdbeditor.appendChild(t.getDOM());
  refreshTablesList();
}

function refreshTablesList(){
  var l=document.getElementById("tables");
  l.innerHTML="";
  for (let i = 0; i < ATables.length; i++) {
    const e = ATables[i];
    var obj = document.createElement("div");
    if (i%2==0)
      obj.className="flow_tables flow_tables_color1";
    else
      obj.className="flow_tables flow_tables_color2";
    
    obj.innerHTML=e.name;
    l.appendChild(obj);
  }
}

function newField(){
  if (SelectedTable!=null){
    SelectedTable.addField("Field"+(idField++),0);
    SelectedTable.refreshFields();
    refreshFieldsList();
  } else {
    alert("Please select a table!");
  }
}

//with contsraints
function refreshFieldsList(){
  if (SelectedTable==null) return;
  var l=document.getElementById("fields");
  l.innerHTML="";
  var co=document.getElementById("constraints");
  co.innerHTML="";
  var coindex=0;

  for (let i = 0; i < SelectedTable.AFields.length; i++) {
    const e = SelectedTable.AFields[i];
    var obj = document.createElement("div");
    if (i%2==0)
      obj.className="flow_fields flow_fields_color1";
    else
      obj.className="flow_fields flow_fields_color2";

    obj.innerHTML=e.name;
    l.appendChild(obj);
    if (e.link!=null){
      var f2=e.link;      
      obj = document.createElement("div");
      if (coindex++%2==0)
        obj.className="flow_constraints flow_constraints_color1"
      else
        obj.className="flow_constraints flow_constraints_color2";
      obj.innerHTML=f2.table.name+"."+f2.name+"->"+e.name;
      co.appendChild(obj);
    }
  }
}

var automodeLink=true;
function newConstraint(b,nohint){  
  if (b!=null){
    if (flowMode==FlowModes.Flow){
      flowMode=FlowModes.Constraint;
      b.innerHTML="Stop link";
      b.className="s100 flow_constraintmode";
      flowdbeditor.style="background-color: #ccccff;";
      if (nohint == null){
        oncehints.hint("NewLink");
      }
    }else {
      if (flowMode==FlowModes.Constraint){
        automodeLink=true;
        flowMode=FlowModes.Flow;
        b.innerHTML="Start link";
        b.className="s100 flow_flowmode";
        flowdbeditor.style="background-color: white;";
      }
    }
  }
}


function titleClick(e){
  this.table.edit(document.getElementById("area"));
}

function fieldClick(e){
  if (flowMode==FlowModes.Flow){
    this.field.edit(document.getElementById("area"));
  }
  if (flowMode==FlowModes.Constraint){
    if (constraintField==null){ //startpoint
      constraintField  = this.field;
    } else { //endpoint
      constraintField.deleteLink();      
      constraintField.addLink(this.field);      
      constraintField  = null;
      if (automodeLink==false){
        var b= document.getElementById("newconstraint");
        newConstraint(b,true); 
      }
    }
  }
}


//TABLE FIELD PANEL REMOVE
function removePanel(div){
  div.parentElement.parentElement.removeChild(div.parentElement);
  stateEdit=false;
}
//TABLE
function editTableOK(div){
  var panel = div.parentElement;
  var ename = document.getElementById('edit_name');
  var ewidth = document.getElementById('edit_width');
  var eheight = document.getElementById('edit_height');
  panel.table.setName(ename.value);
  panel.table.width=Number(ewidth.value);
  panel.table.height=Number(eheight.value);

  removePanel(div);
  panel.table.refreshDOM();
  refreshTablesList();  
}
function editTableCancel(div){
  removePanel(div);
}
function editTableDelete(div){
  if (confirm("DELETE TABLE with all fields! Sure?")) {
    var panel = div.parentElement;
    var index = ATables.indexOf(panel.table);
    if (index > -1) {
      ATables.splice(index, 1);
      panel.table.destroy();
      refreshTablesList();
      removePanel(div);

    }
  } 
}


//FIELD
function editFieldOK(div){
  var panel = div.parentElement;
  var ename = document.getElementById('edit_name');
  var etype = document.getElementById('edit_type');
  var elength = document.getElementById('edit_length');
  panel.field.name = ename.value;
  panel.field.type=Number(etype.value);
  panel.field.length = Number(elength.value);
  removePanel(div);
  panel.field.table.refreshRecordFields();
  panel.field.table.refreshFields();
  refreshFieldsList();
}
function editFieldCancel(div){
  removePanel(div);

}
function editFieldDelete(div){
  if (confirm("DELETE ONE FIELD! Sure?")) {    
    var panel = div.parentElement;
    panel.field.destroy();
    removePanel(div);
  } 
}
function editFieldLink(div){
    automodeLink=false;
    var panel = div.parentElement;
    removePanel(div);
    var b= document.getElementById("newconstraint");
    newConstraint(b,true);
    constraintField  = panel.field;  
    oncehints.hint("NewLinkFromPanel");
}
function editFieldLinkDelete(div){
  if (confirm("DELETE LINK! Sure?")) {    
    var panel = div.parentElement;
    panel.field.deleteLink();
    removePanel(div);
  } 
}



//#endregion HIGH

//#region START MOUSE AND TOUCH

var cX=-1;
var cY=-1;
var grab=0;

function down(e){
  var t = this;
  var b = event.buttons;

  if (flowMode==FlowModes.Flow){
    if (b==1){
      cX = event.clientX-grab;  
      cY = event.clientY-grab; 
      if (SelectedTable!=null) {
        SelectedTable.noSelected();  //table  
      }
      this.table.Selected();  //table
    }
  } 
  if (flowMode==FlowModes.Constraint){
   
  }
}
function contextmenu(e){
    e.preventDefault();
    this.table.browse(document.getElementById("area"));      
}



function touchmove(e){
  //TODO:not working ...  
  
  if (flowMode==FlowModes.Flow){
    
      //if(event.preventDefault) event.preventDefault();
            // perhaps event.targetTouches[0]?
      var evtt = evt.touches[0];

      this.parentElement.appendChild(this);
      dX = evtt.clientX -cX;  
      dY = evtt.clientY -cY;  
      cX = evtt.clientX-grab;  
      cY = evtt.clientY-grab;
      var s = e.getAttribute("transform");
      var o =tool_getTransform(s);
      var s = "translate("+o[0]+","+o[1]+")";
      this.setAttribute("transform",s);
      this.table.setPosXY(o[0],o[1]);
      this.table.refreshConstraints();
    
  }  
}
function move(e){
  var b = event.buttons;
  if (flowMode==FlowModes.Flow){
    if (b==1){
      this.parentElement.appendChild(this);
      dX = event.clientX -cX;  
      dY = event.clientY -cY;  
      cX = event.clientX-grab;  
      cY = event.clientY-grab;
      var s = this.getAttribute("transform");
      var o =tool_getTransform(s);
      var s = "translate("+o[0]+","+o[1]+")";
      this.setAttribute("transform",s);
      this.table.setPosXY(o[0],o[1]);
      this.table.refreshConstraints();
    }
  }  
}
function up(e){
  if (flowMode==FlowModes.Flow){
  this.table.refreshConstraints();
  }
}

//#endregion  MOUSE MOVE TOUCH

//#region TOOLS

function convertRemToPixels(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function tool_getTransform(s){
  s = s.substring(10,999);
  s= s.substring(0,s.length-1);
  s =s.split(",");
  return [Number(s[0])-grab+dX,Number(s[1])-grab+dY];  
}


function savetosvgfile(linknode,svgnode){  // print , flowdbeditor
  linknode=document.getElementById(linknode);
  var svg = document.getElementById(svgnode); //"svg"
  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);
  source=source.replace(/class="flow_fields_color3"/g,'style="fill:grey;stroke-width:0;opacity:0.5"');
  source = source.replace(/class="flow_fields_color4"/g,'style="fill:grey;stroke-width:0;opacity:0.3"');
  source = source.replace(/class="flow_line"/g,'style="stroke:black;stroke-width:2;"');
  source = source.replace(/class="flow_line_start"/g,'style="stroke:blue;stroke-width:4;"');
  source = source.replace(/class="flow_line_end"/g,'style="stroke:orange;stroke-width:2;"');
  //add name spaces.
  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  //convert svg source to URI data scheme.
  //var url = "data:application/download;charset=utf-8,"+encodeURIComponent(source);
  var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);
  //set url value to a element's href attribute.
  linknode.href = url;
  linknode.style.visibility="visible";

  linknode.setAttribute("download","flowdb.svg");
  linknode.innerHTML="RightClickforDownloadSVG";
  //you can download svg file by right click menu.
}

//--------LOAD / SAVE -------------------
var xmlroot="flowdbeditor";
function Save(){
  oncehints.hint("save");
  var xml= document.implementation.createDocument(null, xmlroot);
  var root = xml.getElementsByTagName(xmlroot)[0];
  var setup = xml.createElement("setup");
  setup.setAttribute("idField",idField);
  setup.setAttribute("idTable",idTable);
  root.appendChild(setup);
  for (let i = 0; i < ATables.length; i++) {
    const table = ATables[i];
    table.getXML(xml,root);
  }
  var xmlText = new XMLSerializer().serializeToString(xml);
  localStorage.setItem("flowdbeditor",xmlText);
}
function Load(){
  oncehints.hint("load");
  ATables.clear();
  flowdbeditor.innerHTML=`
      <defs>
          <linearGradient id="e" x1="40" y1="210" x2="460" y2="210" gradientUnits="objectBoundingBox">
              <stop stop-color="steelblue" offset="0" />
              <stop stop-color="red" offset="1" />
          </linearGradient>
      </defs>`; 

  xmlText  = localStorage.getItem("flowdbeditor");
  var oParser = new DOMParser();
  var xml = oParser.parseFromString(xmlText, "text/xml");
  var root = xml.getElementsByTagName(xmlroot)[0];
  var tables = root.getElementsByTagName("table");
  for (let i = 0; i < tables.length; i++) {
    const xmltable = tables[i];
    var t = new TTable("Unknown");
    t.setFromXML(xmltable);
    ATables.push(t);
    flowdbeditor.appendChild(t.getDOM());
  }
  //for constraints
  for (let i = 0; i < ATables.length; i++) {
    const table = ATables[i];    
    table.setLinksFromTemp();
  }
  refreshTablesList();
  var setup = root.getElementsByTagName("setup");
  if ((setup!=null && setup.length>0)){     
     setup=setup[0];
     var v = setup.getAttribute("idField");
     if (v!=null) 
        idField = Number(v);
     v = setup.getAttribute("idTable");
     if (v!=null) 
        idTable = Number(v);

  }
}

//SQL
var SQLdb="flowdbeditor";
var LF='\r\n';
function mySQL(linknode){
  if (ATables==null) return;
  linknode=document.getElementById(linknode);
  source=`START TRANSACTION;`+LF+` 
  SET time_zone = "+00:00";`+LF ;
  source+=`drop database if exists `+SQLdb+`;`+LF+`  
  CREATE DATABASE IF NOT EXISTS `+SQLdb+` DEFAULT CHARACTER SET utf8 COLLATE utf8_hungarian_ci;`+LF+`
  USE `+SQLdb+`;`+LF;

  ATables.forEach(function(table,index){
    source+=`DROP TABLE IF EXISTS `+table.name+`;`+LF+` 
    CREATE TABLE `+table.name+` (`+LF;
    var fields="";
    table.AFields.forEach(function(field,index2){      
      tip= AType.SearchTypeById(field.type);
      source+='`'+field.name+'` '+tip.sql.replace("%",field.length)+','+LF ;
      fields+='`'+field.name+'`,';
    });
    fields=fields.substring(0,fields.length-1);
    source=source.substring(0,source.length-3)+LF; //utolso vesszo
    source+=`) ENGINE=InnoDB DEFAULT CHARSET=utf8;`+LF ;

    if (table.Records!=null && table.Records.length>1){
      source+=`INSERT INTO `+table.name+` (`+fields+`) VALUES `;
      table.Records.forEach(function(o,i){
        if (i>0){
            //content            
            source+=`(`;
            value="";
            o.forEach(function(o2,i2){
              value+="'"+o2+"',";
            });
            source+=value.substring(0,value.length-1);
            source+=`),`;
        }
      });
      source=source.substring(0,source.length-1)+";"+LF;
    }
  });
  //Autoinc primary key
  ATables.forEach(function(table,index){
    var one=false;
    var s="";
    table.AFields.forEach(function(field,index2){      
      if (field.type==3) {//autoinc
        one=true;
        s += 'MODIFY `'+field.name+'` int(11) NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (`'+field.name+'`);'+LF;
      }
    });
    if (one){
      source+=`ALTER TABLE `+table.name+LF+s;
    }
  });
  //constraints
  ATables.forEach(function(table,index){
    var one=false;
    var s="";
    table.AFields.forEach(function(field,index2){ 
      if ( field.link!=null){
        one=true;
        s+='ADD CONSTRAINT `'+table.name+field.link.table.name+'` FOREIGN KEY (`'+field.name+'`) REFERENCES `'+field.link.table.name+'`('+field.link.name+'),'+LF;
      }
    });
    if (one){
      s=s.substring(0,s.length-3)+";"+LF; //utolso vesszo
      source+=`ALTER TABLE `+table.name+LF+s;
    }
  });

  source += 'COMMIT;'+LF ;
  var url = "data:application/sql;charset=utf-8,"+encodeURIComponent(source);
  linknode.href = url;
  linknode.style.visibility="visible";
  linknode.setAttribute("download","flowdb.sql");
  linknode.innerHTML="RightClickforDownloadSQL";
}

function FlowDBSave(linknode) {
  Save();
  var source=localStorage.getItem("flowdbeditor");
  var url = "data:application/sql;charset=utf-8,"+encodeURIComponent(source);
  linknode=document.getElementById(linknode);
  linknode.href = url;
  linknode.style.visibility="visible";
  linknode.setAttribute("download","flowdb.txt");
  linknode.innerHTML="RightClickforDownloadFlowDB";  
}


function FlowDBLoad(event) {
  var input = document.getElementById("filename");
  var reader = new FileReader();
  reader.onload = function(){
    var source = reader.result;        
    //alert(source.substring(0, 200));
    localStorage.setItem("flowdbeditor",source);
    Load();
    console.log(source.substring(0, 200));
  };    
  
  reader.readAsText(input.files[0]);
  
  
}


// LIST  

var Divname=null;
function list( tableidx , divname ){   // tomb.... és "lista"  a div id-je
  if (tableidx<0 || tableidx>=ATables.length) return ;
  if (divname==null)
    divname=Divname;
  Divname=divname;    

  var div = document.getElementById(divname);
  div.innerHTML=`<button onclick="list_new(`+tableidx+`)">NewRecord</button>    
  <button onclick="editTableCancel(this)">Exit</button>`;
  table = ATables[tableidx];
  tomb=table.Records;

  if (tomb.length>1) {
    //fejlec
    var fej = document.createElement("div");
    fej.innerHTML="Sorrendezés:";
    div.appendChild(fej);
    var opt = document.createElement("select");
    var hasOrder = false;   
    opt.setAttribute("onchange","list("+tableidx+")");
    for (let i = 1; i < tomb[0].length; i++) {
        const hdr = tomb[0][i];
        //if (hdr.indexOf("_s")>0) 
        {
            var b  = document.createElement("option");
            b.value=i;
            b.innerHTML=hdr.replace("_s","");
            //if (i==order){
            //    b.setAttribute("selected","");
            //}
            opt.appendChild(b);
            hasOrder=true;
        }
    }
    if (hasOrder){
        fej.appendChild(opt); 
    }

    //tartalom

    var t = document.createElement("table");
    t.className="table";
    div.appendChild(t);

    var combo=null;
    if (constraintList){
      //preprocess
      combo=[];
      table.AFields.forEach(function(o,i){
        if (o.link!=null){
          combo.push( getTable(o.link.table) ) //0,1  idx,name
        } else {
          combo.push(null);
        }
      });
    }
    for (let i = 0; i < tomb.length; i++) {
        const sor = tomb[i];
        var r = document.createElement("tr");
        if (i==0){
            r.setAttribute("class","flow_rec_header");
        }
        t.appendChild(r);
        //r.setAttribute("sqlid",sor[0]);
        for (let j = 1; j < sor.length; j++) {
            var cell=sor[j];
            if ((i==0) || (combo==null) || (combo[j]==null)){
              cell = sor[j];
            }else {
              //comboj !=null
              var t2=combo[j];
              try {
                cell = t2.find( fi => fi[0] == cell )[1];  
              } catch (error) {
              }                                
            }
            var c= document.createElement("td");
            r.appendChild(c);
            c.innerHTML=cell;
        }          
        if(i>0){
            var c= document.createElement("td");
            r.appendChild(c);
            c.innerHTML='<button onclick="list_edit(this,'+tableidx+','+sor[0]+')">Edit</button><button onclick="list_del(this,'+tableidx+','+sor[0]+')">Delete</button>';      
        }
    }
  }                  
}


  function getTable(table) {
    var records=[];    
    Array.prototype.forEach.call(table.Records,function(o,i){
    //
      var sor=Array(2);
      sor[0]=o[0];
      sor[1]="";
      o.forEach(function(o2,i2){
        if (i2>0){
          sor[1]+=o2;
        }
      });
      records.push(sor);
    });
    return records;
  }


  function list_new(tableidx) {
    if ((tableidx<0) || (tableidx>=ATables.length)) 
      return ;
    var t = ATables[tableidx];
    if (t.Records.length<1){
      sor=[];
      for (let i = 0; i < t.AFields.length; i++) {
        const fi = t.AFields[i];
        sor.push(fi.name);  
      }
      t.Records.push(sor);
    }
    sor=[];
    for (let i = 0; i < t.AFields.length; i++) {
      const fi = t.AFields[i];
      if (fi.type==3){        
        sor.push(fi.autoinc++);  
      } else {
        sor.push("Empty");
      }
    }
    t.Records.push(sor);
    //t.Records.push(new Array(t.AFields.length));
    list(tableidx,null);
  }
  function list_edit(e,tableidx,id) {
    var r = e.parentElement;
    if ((tableidx<0) || (tableidx>=ATables.length)) 
      return ;
    var t = ATables[tableidx];
    //var rec = t.Records.find()
    const rec = t.Records.find( fi => fi[0] == id );
    
    var div = document.createElement("div");
    div.id=t.name+id;
    div.className="flow_edit";
    div.innerHTML="";

    var fi = t.AFields;
    fi.forEach(function(f,idx){
      if (f.link==null){
        if (f.type==7){ //bool
          div.innerHTML+=ComboBoxYesNo(rec[idx],f);
        } else if (f.type==3){ //autoinc
          div.innerHTML+=`<label>`+f.name+`</label><div>`+rec[idx]+`</div>`;
        } else {
          typ=AType.SearchTypeById(f.type);                
          div.innerHTML+=`<label>`+f.name+`</label><input type="`+typ.inputtype+`" id="`+t.name+f.name+`" value="`+rec[idx]+`"><br>`;
        }
      } else {
        div.innerHTML+=ComboBox(rec[idx],f,f.link);
      }
    });
     div.innerHTML+=`<button onclick="listEditOK(this)">OK</button>
     <button onclick="listEditCancel(this)">Cancel</button>     
     `;
    div.table=t;
    div.rec=rec;
    r.appendChild(div);
  }
  function listEditOK(e){
    var div = e.parentElement;
    var t=div.table;
    for (let i = 0; i < div.table.AFields.length; i++) { //and div.REC has same element
      const f = t.AFields[i];      
      var o=document.getElementById(t.name+f.name);
      if (o!=null){
        div.rec[i]=o.value;
      }
    }
    removePanel(div);
    list(ATables.indexOf(t),null);
  }
  function listEditCancel(e){
    var div = e.parentElement;
    removePanel(div);
    list(ATables.indexOf(div.table),null);
  }

  function list_del(e,tableidx,id) {
    var div = e.parentElement;//List
    if ((tableidx<0) || (tableidx>=ATables.length)) 
      return ;
    var t = ATables[tableidx];
    t.Records.forEach(function(o,i){
      if ((i>0) && (o[0]==id)){
        if (confirm("I Will DELETE RECORD! Sure?")) {
          t.Records.splice(i,1);
          //removePanel(div);
          list(ATables.indexOf(t),null);
        }
      }
    })


    const rec = t.Records.find( fi => fi[0] == id );

  }

  function ComboBoxYesNo(value,field1) {
    var opt = `<label>`+field1.name+`</label><select id="`+field1.table.name+field1.name+`">`;
    opt+=`<option `;
    if (value==0) {
      opt+=`selected `;
    }
    opt+=`value="0">Nem</option>`;
    opt+=`<option `;
    if (value==1) {
      opt+=`selected `;
    }
    return (opt+=`value="1">Igen</option></select><br>`);
  }

  function ComboBox(value,field1,field2){
    var opt = `<label>`+field1.name+`</label><select id="`+field1.table.name+field1.name+`">`;
    if (field2.table.Records.length>0){
      var displayidx=-1; //displayfield if was set
      for (let i = 0; i < field2.table.AFields.length; i++) {
        if (field2.table.AFields[i].display==true){
          displayidx=i;
        }
      }    
      for (let i = 1; i < field2.table.Records.length; i++) {
        const rec = field2.table.Records[i];
        var id=rec[0];
        if (displayidx>-1) {
          displayText = rec[displayidx];
        } else {
          displayText="";
          rec.forEach(function(o){
            displayText+=o+" ";
          })
        }
        displayText=displayText.trim();

        if (id==value){
          opt+=`<option selected `;  
        }else {
          opt+=`<option `;  
        }
        opt+=`value="`+id+`">`+displayText+`</option>`
      }   
    }  
    return (opt+`</select><br>`);    
  }

//#endregion TOOLS
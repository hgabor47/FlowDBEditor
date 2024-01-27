var ver = 'Effector plugin 1.1';
var scriptstart=false;
loadSQLScript(function(){
    scriptstart=true;
    var helpp = document.getElementById('moreinfo');
    helpp.innerHTML+="<span> +"+ver+" </span>";
    helpp.innerHTML+="<a class='addoninfo' href='http://172.24.112.109/effector/xml.exe'>XMLStarlet</a>";
    helpp.innerHTML+="<a class='addoninfo' href='http://172.24.112.109/effector/xml.exe'>Microsoft SQLCMD</a>";
    helpp.innerHTML+=" <a class='addoninfo' href='http://172.24.112.109/effector/tutorial.mp4' target='_blank' >EffectorFlow tutorial</a>";
    AType[0].effectortype="TextBox";
    AType[1].effectortype="TextBox";
    AType[2].effectortype="TextBox";
    AType[3].effectortype="TextBox";
    AType[4].effectortype="Date";
    AType[5].effectortype="DateTime";
    AType[6].effectortype="TextBox";
    AType[7].effectortype="CheckBox";
    AType[8].effectortype="TextBox";
    setWorkflowConnectType();

});

var flowdbeffdiv=null;
var AScreens = [];
var ADesigns = [];
var AScreenType=[[0,"Browse list"],[1,"Edit form"]];
var AScreenSource=[[0,"Table"],[1,"Custom SQL"]];
var ADesignTypes=[[0,"1p"],[1,"2pv"],[2,"2pf"],[3,"3pv"],[4,"3pf"],[5,"4p"],[6,"6pv"],[7,"6pf"]];

var prop_dbproject="";
var prop_dbextraname="";
var prop_dbpath="";
var prop_usesqlcmd=null;

//region INITIALIZE and SQL functions

function flowdbeff(button){    
    if (flowdbeffdiv==null){        
        var mainarea=document.getElementById("mainarea");
        flowdbeffdiv = document.createElement("div");
        flowdbeffdiv.className="row";
        flowdbeffdiv.id="flowdbeff";
        mainarea.appendChild(flowdbeffdiv);
        flowdbeffdiv.innerHTML=`<nav id="effmenu" style="margin-top:30px;"> </nav><div id="effarea"></div><div id="efflist"></div>`;
        var effmenu=document.getElementById("effmenu");
        var s = `<span><span class="borderGray"><button class="btn" onclick='{document.getElementById("flowdbeff").style.display="none"; document.getElementById("area").style.display="flex";document.getElementById("menupanel").style.display="block"}'>FlowDBEditor</button></span>`;
        
        s += `<span class="borderGray"><button class="btn" onclick='BOSave(document.getElementById("title").value);'>BO</button>`;
        s += `<button class="btn" onclick='DDSave(document.getElementById("title").value);'>DD</button>`;
        s += `<button class="btn" onclick='DispSave(document.getElementById("title").value);'>DispD</button>`;
        s += `<button class="btn" onclick='FOSave(document.getElementById("title").value);'>FORM (DD+BO+Combo..)</button>Extra name<input id="dbextraname" type="text" hint="Gombnyomáskor az XML nevekbe extra egyedi szövegrészlet beillesztése" onblur="prop_dbextraname=this.value;" placeholder="" onmouseover="showhint(this,1)" onmouseout="showhint(this,0)"></span>`; 
                                                    //sqldb
        s += `<span><span class="borderYellow">Project<input id="dbproject" type="text" onblur="prop_dbproject=this.value;" placeholder="Projektnév"><button class="btn btn-warning" onclick="EFFMSSQL('print',0)" hint="A 'projeknév' mező szerinti előtagú táblák kerülnek az SQL-be." onmouseover="showhint(this,1)" onmouseout="showhint(this,0)" >Effector MSSQL</button>`;
        s += `<button class="btn btn-warning" onclick="EFFFlow('print',0)" hint="
             Két fájl készül. Egy batch, melyet futtatni kell. És egy SQL.<br>
             A folyamatban résztvevő táblák kerülnek az SQL-be.<br>
             Az érintett táblák kiegészülnek a 'projektnév' mezőben lévő előtaggal." 
            onmouseover="showhint(this,1)" onmouseout="showhint(this,0)">Effector Flow</button>`;
        s += `<input id="usesqlcmd" type="checkbox" onblur="prop_usesqlcmd=this.checked;" >USE SQLCMD
            <input id="dbpath" type="text" placeholder="Effector xml útvonal" onblur="prop_dbpath=this.value;" hint="Útvonal ahol a Workflows.xml van!" onmouseover="showhint(this,1)" onmouseout="showhint(this,0)">
            </span></span>`;
        effmenu.innerHTML=s;
        
    } 
    document.getElementById("menupanel").style.display='none';
    document.getElementById("dbextraname").value=prop_dbextraname;
    document.getElementById("usesqlcmd").checked=prop_usesqlcmd;
    document.getElementById("dbpath").value=prop_dbpath;
    flowdbeffdiv.style.display="inline";    
    var effarea=document.getElementById("effarea");
    effarea.innerHTML="";        
    init(effarea);
    document.getElementById("area").style.display="none";
    //setEffFromXML();
}

function flowdbeffLoad(root,setup){
    try {
        prop_dbproject = setup.getAttribute("effproject");
        prop_usesqlcmd = setup.getAttribute("usesqlcmd")=="true";
        prop_dbpath = setup.getAttribute("effpath");        
        prop_dbextraname = setup.getAttribute("effextraname");
    } catch (error) {
    }   
}

function flowdbeffSave(xml,root,setup){
    setup.setAttribute("effproject", prop_dbproject);
    setup.setAttribute("effpath", prop_dbpath);
    setup.setAttribute("usesqlcmd", prop_usesqlcmd);
    setup.setAttribute("effextraname", prop_dbextraname);
}

function setWorkflowConnectType(){
    var div=document.getElementById("workflowedit");
    div.innerHTML=
    `
    <div>Effector workflow type</div>
    <div id="wfe_triggers">
        <template id="temp_wf_option">
            <select id="wfe_trigger_option%">
                <option value="0">SQL</option>
                <option value="1">Constant</option>
            </select>
            <textarea id="wfe_trigger_text%" cols="30" rows="10"></textarea>
        </template>
    </div>
    <select id="wfe_trigger_mode">
        <option value="0">Nincs</option>                
        <option value="1">AND minden előzőnek teljesülnie kell</option>
        <option value="2">OR Bármelyik teljesül minden ágra 1x</option>
    </select>
    <button onclick="wflink_ok(this)">OK</button>
    <button onclick="this.parentElement.style.visibility='hidden';">Cancel</button>
    <button onclick="wflink_delete(this)">Delete</button>`;
}

function UU(s){
    if (s==null) return "";
    s=""+s;
    return s.toUpperCase();
}
function LL(s){
    if (s==null) return "";
    s=""+s;
    return s.toLowerCase();
}
function CC(str){
    if (str==null) return "";
    str=""+str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function loadSQLScript(fuggv){
    fuggv();
    /*
    var script = document.createElement('script');
    script.onload = fuggv;
    script.src = "https://kripken.github.io/sql.js/js/sql.js";
    document.head.appendChild(script);     
    */
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

function SaveXML(filename,source){
    var url = "data:application/xml;charset=iso-8859-2,"+encodeURIComponent(source);
    linknode=document.getElementById('print');
    linknode.href = url;
    //linknode.style.visibility="visible";
    linknode.setAttribute("download",filename+".xml");
    linknode.innerHTML="RightClickforDownloadSQL";
    linknode.click();
}

function COMPSave(title,extform='Form',extfile=''){    
    var sid='';
    AScreens.forEach(function(scr,idx){
        if (!scr.enable) return;
        var filename = getFilename(scr.table.name,title);  
        var source=`<?xml version="1.0" encoding="utf-8"?>`+LF+`<Component xmlns="http://effector.hu/schema/ns/component">
  <AreHeaderButtonsVisible>false</AreHeaderButtonsVisible>
  <AreSpaceSavingButtonsVisible>false</AreSpaceSavingButtonsVisible>
  <Tabs>
    <Tab id="tab_4684">
        <Caption>`+filename+`</Caption>
        <ResourceName>`+extform+filename+`</ResourceName>
        <RefreshParentOnClose>true</RefreshParentOnClose>  
      </Tab>
    </Tabs>
</Component>`;            
        SaveXML('Component'+filename+extfile,source);        
    });
}

function SCREENSave(title,extcomp='',extfile=''){    
    var sid='';
    AScreens.forEach(function(scr,idx){
        if (!scr.enable) return;
        var filename = getFilename(scr.table.name,title);  
        var source=`<?xml version="1.0" encoding="utf-8"?>`+LF+`<Screen xmlns="http://effector.hu/schema/ns/screen">
  <Caption>`+filename+`</Caption>
  <Width>90%</Width><Height>90%</Height>
  <Component>Component`+filename+extcomp+`</Component>
</Screen>`;            
        SaveXML('Screen'+filename+extfile,source);        
    });
}

function VerifyFailBeforeRUN(){
    dp=document.getElementById("dbproject").value;
    if ((dp=='') || (dp=='null')){
        alert('The Project field is empty! Fill it before generate!');
        return true;
    }
    return false;
}

function DDSave(title){  
    if (VerifyFailBeforeRUN()) return;
    var sid='';
    AScreens.forEach(function(scr,idx){
         if (!scr.enable) return;  
            var source=`<?xml version="1.0" encoding="utf-8"?>`+LF+`<DataDefinition xmlns="http://effector.hu/schema/ns/datadefinition">`+LF+
`<SqlSelect>FROM `+scr.table.name+` WHERE Deleted=0 and 1=1 </SqlSelect>
<Columns>`+LF;
            for(var i=0;i<scr.table.AFields.length;i++){
                f=scr.table.AFields[i];
                if (i==0){
                    sid=f.name;
                    source+=`
    <Column name="`+f.name+`">
        <Definition>[`+f.name+`]</Definition>
        <IdColumn>`+f.name+`</IdColumn>
        <OutFilter>
            <Alias>`+f.name+`_ID</Alias>
            <Type>Out</Type>
        </OutFilter>
    </Column>`+LF;
                }else{
                    source+=`
    <Column name="`+f.name+`">
        <Definition>[`+f.name+`]</Definition>
        <IdColumn>`+sid+`</IdColumn>
    </Column>`+LF;
                }
            } 
            source+=`
</Columns>
</DataDefinition>`;
            var filename = getFilename(scr.table.name,title);
            SaveXML('DataDefinition'+filename,source);
        
    });
}

function BOSave(title){    
    if (VerifyFailBeforeRUN()) return;
    var fi='<Fields>'+LF;
    var f=null;
    AScreens.forEach(function(scr,idx){
        if (!scr.enable) return;
            var filename = getFilename(scr.table.name,title);

            var source=`<?xml version="1.0" encoding="utf-8"?>`+LF+`<BusinessObject xmlns="http://effector.hu/schema/ns/businessobject">`+LF+
            `<DataTable>`+scr.table.name+`</DataTable>`+LF;
            for(var i=0;i<scr.table.AFields.length;i++){
                f=scr.table.AFields[i];
                if (i==0){
                    source+=`<UniqueIDColumn>`+f.name+`</UniqueIDColumn>`+LF;
                    fi+=`   <Field name="`+f.name+`" />`+LF;
                }else{
                    if (f.name.toLowerCase() !="deleted"){
                        fi+=`   <Field name="`+f.name+`" />`+LF;
                    }
                }
            } 
            fi+=`</Fields>`+LF;
            source+=fi+`</BusinessObject>`;
            
            SaveXML('BusinessObject'+filename,source);
        
    });
}

function FOControlTextbox(finame,ismultiline=false,left=160){
    var s= `            <Control><Type>TextBox</Type>
                <Name>Control_`+finame+`</Name>
                <Width>200</Width><Left>`+left+`</Left>
                <BindingName>`+finame+`</BindingName>
                <TextAlign>Left</TextAlign>`+LF;
    if (ismultiline){
        s+=`                <IsMultiline isResizable="false">true</IsMultiline>`+LF;
    }
    s+=`                <Readonly type="Constant" return="boolean" default="true">false</Readonly>
            </Control>`;
    return s;
}
function FOControlDate(finame,left=160){
    var s= `            <Control><Type>Date</Type>
                <Name>Control_`+finame+`</Name>
                <Width>200</Width><Left>`+left+`</Left>
                <BindingName>`+finame+`</BindingName>`+LF;
    s+=`                <Readonly type="Constant" return="boolean" default="true">false</Readonly>
            </Control>`;
    return s;
}
function FOControlCheckbox(finame){
    var s= `            <Control><Type>CheckBox</Type>
                <Name>Control_`+finame+`</Name>
                <Width>200</Width>
                <BindingName>`+finame+`</BindingName>`+LF;
    s+=`                <Readonly type="Constant" return="boolean" default="true">false</Readonly>
            </Control>`;
    return s;
}
function FOControlCombo(combofilename,finame,left=160){
    var s= `            <Control><Type>ComboBox</Type>
                <Name>Control_`+finame+`</Name>
                <Width>200</Width><Left>`+left+`</Left>
                <BindingName>`+finame+`</BindingName>
                <ComboDefinition>`+combofilename+`</ComboDefinition>`+LF;
    s+=`                <Readonly type="Constant" return="boolean" default="true">false</Readonly>
            </Control>`;
    return s;
}

function FOSave(title){
    if (VerifyFailBeforeRUN()) return;
    DDSave(title);
    BOSave(title);
    COMPSave(title);
    SCREENSave(title);      
    var tidx=0;
    var f=null;
    var cg=`<ControlGroupOrders>
   <ControlGroupOrder isAutomatic="false">`+LF;  
    
    AScreens.forEach(function(scr,idx){
        if (!scr.enable) return;
            var filename = getFilename(scr.table.name,title);

            var source=`<?xml version="1.0" encoding="utf-8"?>`+LF+`<Form xmlns="http://effector.hu/schema/ns/form">`+LF+
`<Caption>`+scr.table.name+`</Caption>
<DataDefinition>DataDefinition`+filename+`</DataDefinition>
<BusinessObject>BusinessObject`+filename+`</BusinessObject>
<ReportContentChangedOnValueChange>false</ReportContentChangedOnValueChange>
<ControlGroups>
    <ControlGroup name="Rights_RO100">
    <Controls>
        <Control>
            <Name>Rights_RO100F</Name>
            <BindingName>Closed</BindingName> <!--A RIGHTS-ban felhasznált mezőnek léteznie kell a FORM-on hogy beolvassa-->
            <Type>TextBox</Type>
        </Control>
        <Control>
            <Name>Rights_RO100</Name>
            <BindingName>Rights_RO100</BindingName>
            <ComputedValue default="false" type="SQL" return="string">
                select case when '[##Field.Closed##]'=1 then 'true' else 'false' end
            </ComputedValue>
            <DefaultValue default="false" type="SQL" return="string">
                select case when '[##Field.Closed##]'=1 then 'true' else 'false' end
            </DefaultValue>
            <Type>TextBox</Type>
            <Recomputing>Always</Recomputing>
        </Control>
    </Controls>
    <Rules>
        <Visible>false</Visible>
    </Rules>
    </ControlGroup>
`+LF+LF+LF+LF;
            for(var i=0;i<scr.table.AFields.length;i++){
                f=scr.table.AFields[i];
                if (i==0){ //for ID
source+=`   <ControlGroup name="`+f.name+`">
        <Controls>
            <Control>
                <Type>Label</Type>
                <Name>Label_`+f.name+`</Name>
                <Caption>`+f.name+`</Caption>
                <Width>150</Width>
            </Control>
            <Control>
                <Type>TextBox</Type>
                <Name>Control_`+f.name+`</Name>
                <Width>200</Width>
                <BindingName>`+f.name+`</BindingName>
                <TextAlign>Left</TextAlign>
            </Control>
        </Controls>
        <Rules>
            <Visible type="Constant" return="boolean" default="true">false</Visible>
        </Rules>
    </ControlGroup>
`+LF;                    
                }else{ //any fields
                    if (f.name.toLowerCase() !="deleted"){
                        cg+=`   <ControlGroup>`+f.name+`</ControlGroup>`+LF;
source+=`   <ControlGroup name="`+f.name+`">
        <Controls>
            <Control>
                <Type>Label</Type>
                <Name>Label_`+f.name+`</Name>
                <Caption>`+f.name+`</Caption>
                <Width>150</Width>
            </Control>`+LF;
                        if (f.link!=null){ //iflink
                            var combofilename = ComboD_direct(title,f);
                            tidx=combofilename[1];
                            source+=FOControlCombo(combofilename[0],f.name)+LF;
                        } else {//iflinkelse
                            switch (f.type){
                            default:
                                source+=FOControlTextbox(f.name)+LF;
                                break;                         
                            case 8:
                                source+=FOControlTextbox(f.name,true)+LF;
                                break;                        
                            case 4:
                                    source+=FOControlDate(f.name)+LF;
                                    break;
                            case 7:
                                source+=FOControlCheckbox(f.name)+LF;
                                break;
                            }
                        }
                        source+=`       </Controls>
                    <Rules>
                <Visible type="Constant" return="boolean" default="true">true</Visible>
            </Rules>
       </ControlGroup>`+LF;                                                
            
                    }//if
                    
                } //else
            } //for
            source+=`
            <ControlGroup name="ClickedButton">
                <Controls>
                    <Control>
                        <Type>TextBox</Type>
                        <Name>CheckBox_ClickedButton</Name>
                        <BindingName>ClickedButton</BindingName>
                        <ComputedValue type="SQL" return="string" default="">select '[##Special.ClickedButton##]'</ComputedValue>
                    </Control>
                </Controls>
                <Rules>
                    <Visible>false</Visible>
                </Rules>
            </ControlGroup>	

            <ControlGroup name="ButtonGroup">
            <Controls>
              <Control>
                <Type>SaveButton</Type>
                <Name>Save</Name>
                <Caption>[#EditFormPanel.SaveButton#]</Caption>
                <Visible>'[##Field.Rights_RO100##]'.toLowerCase()</Visible>
                <!--<Visible type="SQL" default="true" return="boolean" >select '[##Field.Rights_RO100##]'</Visible>-->
              </Control>
              <Control>
                <Type>CancelButton</Type>
                <Name>Cancel</Name>
                <Caption>[#EditFormPanel.CancelButton#]</Caption>
                <Width>50</Width>
              </Control>
              <Control>
                <Type>DeleteButton</Type>
                <Name>Delete</Name>
                <Caption>[#EditFormPanel.DeleteButton#]</Caption>
                <Width>50</Width>
                <Visible type="Simple" return="boolean" default="false">'[##Filter.JumpType##]' != 'New'</Visible>
              </Control>
            </Controls>
          </ControlGroup>      
            </ControlGroups>`+LF;
            //source+=cg+`      <ControlGroup>ButtonGroup</ControlGroup>
            //</ControlGroupOrder></ControlGroupOrders>`+LF;
            source+=`</Form>`;
            //var filename=scr.table.name.toLowerCase().replace(title.toLowerCase(),title).replace(/_/g,'');
            SaveXML('Form'+filename,source);
        
    });
}

function getFilename(tablename,title){
    var dbextraname= document.getElementById("dbextraname").value;
    var dbproject= document.getElementById("dbproject").value;if (dbproject=='') dbproject=title
    var tbname = LL(tablename).replace(LL(title),'').replace(/_/g,'')+LL(dbextraname);
    var filename=dbproject+CC(tbname);
    return filename;
}


function DispSave(title){
    if (VerifyFailBeforeRUN()) return;
    var sid='';
    SCREENSave(title,'disp','disp');    
    COMPSave(title,'DisplayDefinition','disp');

    AScreens.forEach(function(scr,idx){
         if (!scr.enable) return;           
         var filename = getFilename(scr.table.name,title);
         var source=`<?xml version="1.0" encoding="utf-8"?>`+LF+`<DisplayDefinition xmlns="http://effector.hu/schema/ns/displaydefinition">`+LF+
`<Caption>`+scr.table.name+`</Caption>
<ViewType>Card</ViewType>
<DefaultSelectionType>Multiple</DefaultSelectionType>
<PageSize>100</PageSize>
<AlternatePageSize>1000</AlternatePageSize>
<OrderBy direction="Asc">nev</OrderBy>
<DataDefinition>DataDefinition`+filename+`</DataDefinition>
<Columns>`+LF;
            for(var i=0;i<scr.table.AFields.length;i++){
                f=scr.table.AFields[i];
                if (i==0){
                    sid=f.name;                    
                }                
                source+=`
    <Column name="`+f.name+`">
        <Visible>true</Visible>
    </Column>`+LF;
            } 
            source+=`
</Columns>
<OutFilterColumn>`+sid+`</OutFilterColumn>
<HTMLTemplates>
    <HTMLTemplate width="300px" height="102px">
      <![CDATA[
          <div style="height:102px; width:300px; background:url(ui/gfx/card_msk_kex_jelentkezo_[##idszin##][##Iscvlinkid##].png);">
          
              <div style="position: relative;
                          height: 25px;
                          width: 300px;
                          color: black;
                          font-weight: bold;
                          margin: 0;
                          padding: 4px 0px 0px 75px;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;"><b>[##nev##]</b></div>
                        
              <div style="position: relative; float: left; height:88px; width:300px;">          
                          
                    <div style="position: relative; 
                          height: 24px; 
                          width: 300px; 
                          font-size: 100%;
                          margin: 0;
                          padding: 5px 0px 0px 95px;
                          color: black;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;">[##telefonszam##]</div>          
                          
                    <div style="position: relative; float: left; 
                          height: 24px; 
                          width: 270px; 
                          font-size: 100%;
                          margin: 0;
                          padding: 5px 0px 0px 95px;
                          color: black;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;">[##email##]</div>
                          
                    <div style="position: relative; float: left; 
                          height: 24px; 
                          width: 300px; 
                          font-size: 100%;
                          margin: 0;
                          padding: 5px 0px 0px 95px;
                          color: black;">[##datum##]</div>
                          
              </div>
          </div>
        ]]>
    </HTMLTemplate>
  </HTMLTemplates>
  <ControlPanel>
  <Controls>
      <Control>
          <Name>Filter_ID</Name>
          <Type>TextSearch</Type>
          <Caption>ID</Caption>
          <ConnectedColumnDefinition>`+sid+`</ConnectedColumnDefinition>
          <Operator>=</Operator>
          <Width>200</Width>
          <DefaultValue type="Constant" return="int" default="">'[##Filter.`+sid+`_ID##]'</DefaultValue>
          <Visible>false</Visible>
      </Control> <!--IDFILTER-->
      <Control>
          <Name>NewObject</Name>
          <Type>NewObjectButton</Type>
          <Caption>Hozzáadás</Caption>
          <BusinessObject>BusinessObject`+filename+`</BusinessObject>
          <Screen>Screen`+filename+`</Screen>
      </Control>
      <Control>
          <Name>Delete</Name>
          <Type>DeleteObjectButton</Type>
          <Caption>Törlés</Caption>
          <BusinessObject idColumn="id">BusinessObjectMSKFEBTervezetmjgy</BusinessObject>
      </Control>
  </Controls>
</ControlPanel>

</DisplayDefinition>`;
            
            SaveXML('DisplayDefinition'+filename,source);
        
    });
}

function ComboD_direct(title,field){ //skey ha ures akkor az elso mező, ha nem üres, akkor AZ    
    //preprocess //The list of record contain field values from another linked table
    var tidx=0;
    var table = field.link.table;
    var skey = field.link.name;
    var linkfield = field.link;
    var linkedfields=null;
    var key=`key_`+table.name;
    linkedfields=getLinkedFields(linkfield,1);
    //from and where
    var Lfi='t'+tidx+'.'+linkedfields[0][1].name+` as `+key+`, concat(''`;    
    var Lleft='from '+linkedfields[0][1].table.name+' t'+tidx+' ';
    linkedfields[0][1].table.aliasname=tidx;
    //var Lwh = 'where t'+tidx+'.'+linkedfields[0][1].name+'='+field.name+' ';    
    
    for(var i=1;i<linkedfields.length;i++){
        var e=linkedfields[i];
        if (Array.isArray(e)) { //key            
            Lleft+= ' left join '+e[1].table.name+' t'+(tidx+1)+' on t'+(tidx+1)+'.'+e[1].name+'=t'+e[0].table.aliasname+'.'+e[0].name+' ' ;
            tidx++;    
            e[1].table.aliasname=tidx;                
        }else{
            Lfi+=', t'+tidx+'.'+e.name 
        }        
    }    
    Lfi+=') as combo_'+table.name;

    
    var f=null;
    //var skey='';
    var fields =[];
    var displayfield=`combo_`+table.name;
    var filename=table.name.toLowerCase().replace(title.toLowerCase(),title).replace(/_/g,'');
    for(var i=0;i<table.AFields.length;i++){
        f=table.AFields[i];
        if ((i==0) && (skey=='')) {                         
            skey=f.name;
        } else {
            if (f.display){
                fields.push(f.name);
            }
        }
    }
    if (fields.length<1){
        alert('None display field for combo');
        return ;
    }
    var sfields='';
    if (fields.length>1){
        for(var i=0;i<fields.length;i++){
            if (i==0) { sfields=`concat(`+fields[i]+','; }
            else sfields+=fields[i]+','
        }
        sfields+=`) as `+displayfield;
    }else{
        sfields=fields[0]+` as `+displayfield;
    }
    

    var s=`<?xml version="1.0" encoding="utf-8"?>
<ComboDefinition xmlns="http://effector.hu/schema/ns/combodefinition">
  <SourceType>Database</SourceType>
  <Source>
    <Database>
      <SelectionString>
        <![CDATA[
          SELECT `+Lfi+`                   
                  `+Lleft+` WHERE t0.Deleted=0 AND 1=1 ORDER BY 2
          ]]>
      </SelectionString>
      <KeyColumn>`+key+`</KeyColumn>
      <ValueColumn>`+displayfield+`</ValueColumn>
    </Database>
  </Source>
</ComboDefinition>`;
var filename = getFilename(table.name,title);

SaveXML('Combo'+filename,s);
return ['Combo'+filename,tidx];
}

function ComboD(title){
    AScreens.forEach(function(scr,idx){
        ComboD_direct(title,scr.table);
    });
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
        if (this.enable)
            s="<span><input type='checkbox' checked onchange='ScreenChange(this)'></span>";
        else
            s="<span><input type='checkbox' onchange='ScreenChange(this)'></span>";
        s+="<span><span>From "+AScreenSource[this.source][1]+"</span><span>"+AScreenType[this.type][1]+"</span><br>";
        if (this.source==1){
            s+="<textarea style='width:80%;' placeholder='SQL Expression'>"+generateSQL(this.table)+"</textarea>";
        } else {
            s+="<div>"+this.table.name+"</div>";
        }
        div.innerHTML=s+"</span>";
        return div;
    }
}

function ScreenChange(chkbox)
{
    var div=chkbox.parentElement.parentElement;
    div.screen.enable=chkbox.checked;
}

TDesign = function(typeindex,screensarray){
    AScreens = [];  //used screens pl.     1,4,3 / 3pf
    DesignType = 0; //ADesignTypesIndex            4

    // 4,[1,4,3]
    this.DesignType=typeindex;
    this.AScreens=screensarray;
    
}


var tableprefix="";
function TEMP_FlowtablesRename(on=true){
    tableprefix="";
    try { tableprefix=document.getElementById("dbproject").value; } catch (error) {};    
    if (tableprefix=="") return;

    for (let i = 0; i < ATables.length; i++) {
        const t = ATables[i];
        if (TWFLink.hasFlow(t)){
            if (on){
                t.name=tableprefix+"_"+t.name;
            }else{
                t.name=t.name.substr(tableprefix.length+1,9999);
            }
        }
    }
}


var wfid="KEXFEB1";
function EFFFlow(linknode,ver){
    /*Effector workflow batch maker based XML.EXE */
    TEMP_FlowtablesRename();
    EFFWorkflowSQL(linknode,ver); //all tables
    linknode=document.getElementById(linknode);    
    try { wfid=document.getElementById("dbproject").value; } catch (error) {};    
    var wfcaption=wfid;
    var source=`@echo off
echo "XML Starlet letoltheto: https://sourceforge.net/projects/xmlstar/files/xmlstarlet/1.6.1/xmlstarlet-1.6.1-win32.zip/download"
del /Q BusinessObject
del /Q EditForm
del /Q Workflow
md Workflow
md BusinessObject
md EditForm
if not exist Workflows.xml echo ^<?xml version="1.0" encoding="utf-8"?^>^<Workflows^>^</Workflows^> >Workflows.xml
xml ed -L -s /Workflows -t elem -n Workflow -s /Workflows/Workflow[last()] -t elem -n ObjectType -v `+wfid+` -s /Workflows/Workflow[last()] -t elem -n Caption -v `+wfcaption+` workflows.xml
echo Workflow
md Workflow
md BusinessObject
md EditForm
echo ^<?xml version="1.0" encoding="utf-8"?^>^<Workflow/^> >Workflow/Workflow`+wfid+`.1.xml
xml ed -L -s /Workflow -t elem -n Steps Workflow/Workflow`+wfid+`.1.xml
`;
    source_WFMid="";
    source_WFEnd="";
    for (let i = 0; i < ATables.length; i++) {
        const t = ATables[i];
        if (TWFLink.hasFlow(t)){
            
            var fragmentnn = `FragmentEvent`+t.name;
            if (!t.properties.Get("wfstart")){ //(!t.name.endsWith("start")) {
                var nn = `BusinessObjectEvent`+t.name;
                if (t.properties.Get("wfend")){ //(t.name.endsWith("end")) {
                    source_WFEnd +=`\n\nxml ed -L -s /Workflow/Steps -t elem -n Step -a /Workflow/Steps/Step[last()] -t attr -n isStop -v true -s /Workflow/Steps/Step[last()] -t elem -n BusinessObject -v `+nn+` -a $prev -t elem -n Caption -v `+t.name+` Workflow/Workflow`+wfid+`.1.xml`;
                }else{
                    source_WFMid +=`\n\nxml ed -L -s /Workflow/Steps -t elem -n Step -s /Workflow/Steps/Step[last()] -t elem -n BusinessObject -v `+nn+` -a $prev -t elem -n Caption -v `+t.name+` Workflow/Workflow`+wfid+`.1.xml`;
                }       
                source+=EFFFlow_BOE(nn,t);     
                source+=EFFFlow_FEE(fragmentnn,t);
            } else {
                var nn=`BusinessObjectProject`+wfid;            
                source +=`\n\nxml ed -L -s /Workflow/Steps -t elem -n Step -s /Workflow/Steps/Step[last()] -t elem -n BusinessObject -v `+nn+` -a $prev -t elem -n Caption -v `+t.name+` Workflow/Workflow`+wfid+`.1.xml`;            
                source+=EFFFlow_BOP(nn,t);
                source+=EFFFlow_FEP(fragmentnn,t);
            }        
            
        }
    }
    source+=source_WFMid;
    source+=source_WFEnd;

    if (document.getElementById("usesqlcmd").checked){
        source+='\nsqlcmd -S localhost -i flowdbeffms.sql';
    }else {
        source+='\nrem sqlcmd -S localhost -i flowdbeffms.sql';
    }
    source+='\n';
    var url = "data:application/bat;charset=iso-8859-2,"+encodeURIComponent(source);
    linknode.href = url;
    //linknode.style.visibility="visible";
    linknode.setAttribute("download","workflow.bat");
    linknode.innerHTML="RightClickforDownloadSQL";
    
    linknode.click();
    TEMP_FlowtablesRename(false);
}

function EFFFlow_BOE(name,table){ //BusinessObjectEvent
    var description = table.description;
    var felelos="3";
    var source=`\necho ^<?xml version="1.0" encoding="ISO-8859-2"?^>^<BusinessObject/^> >BusinessObject/`+name+`.xml`;
    source+=`\nxml ed -L -s /BusinessObject -t elem -n ParentBusinessObject -v BusinessObjectEvent`;
    source+=` -s /BusinessObject -t elem -n DataTable -v `+table.name;
    source+=` -s /BusinessObject -t elem -n UniqueIDColumn -v U_EventID`;
    source+=` -s /BusinessObject -t elem -n Fields`;
    source+=` -s /BusinessObject -t elem -n Triggers`;
    source+=` -s /BusinessObject/Fields -t elem -n Field -a /BusinessObject/Fields/Field[last()] -t attr -n name -v U_EventID`;
    source+=` -s /BusinessObject/Fields -t elem -n Field -a /BusinessObject/Fields/Field[last()] -t attr -n name -v Description -s /BusinessObject/Fields/Field[last()] -t elem -n DefaultValue -v "`+description+`" -a $prev -t attr -n type -v Constant -a $prev/.. -t attr -n return -v string -a $prev/.. -t attr -n default`;
    source+=` -s /BusinessObject/Fields -t elem -n Field -a /BusinessObject/Fields/Field[last()] -t attr -n name -v Felelos -s /BusinessObject/Fields/Field[last()] -t elem -n DefaultValue -v "`+felelos+`" -a $prev -t attr -n type -v Constant -a $prev/.. -t attr -n return -v string -a $prev/.. -t attr -n default`;
    
    for (let i = 0; i < table.AFields.length; i++) {
        const f = table.AFields[i];
        if (f.name!='id'){
            source+=` -s /BusinessObject/Fields -t elem -n Field -a /BusinessObject/Fields/Field[last()] -t attr -n name -v `+f.name;
        }
    }    
    //TODO triggers
    source+=` ^\n`;
    var links= TWFLink.searchNext(table);
    for (let i = 0; i < links.length; i++) {
        const e = links[i].prev; //table előző
        source+=` -s /BusinessObject/Triggers -t elem -n Trigger ^\n`;
        source+=` -s $prev -t attr -n group -v 0^\n`;
        source+=` -s $prev/.. -t attr -n action -v Create^\n`;
        if (e.properties.Get("wfstart")){//(e.name.endsWith("start")){
            source+=` -s $prev/.. -t attr -n sourceBusinessObject -v Project^\n`;
            source+=` -s $prev/.. -t attr -n sourceObjectType -v `+wfid+`^\n`;
            source+=` -s $prev/.. -t attr -n event -v Created^\n`;    
        }else {
            source+=` -s $prev/.. -t attr -n sourceBusinessObject -v Event^\n`;
            source+=` -s $prev/.. -t attr -n sourceObjectType -v `+e.name+`^\n`;
            source+=` -s $prev/.. -t attr -n event -v Done^\n`;
        }
        if ((links[i].prop_triggermode==null) || (links[i].prop_triggermode=="0")) {
            source+=` -s $prev/.. -t elem -n Condition -v "select 'true'"^\n`;
        } else {
            if (links[i].prop_triggermode=="1"){
                //if (e.name.endsWith("start")){
                    source +=` -s $prev/.. -t elem -n Condition -v "select case when 0=(	select count(*) from Event where ProjectID = [##Field.ProjectID##] and (parenteventID is null)  and Done=0) then 'true' else 'false' END"^\n`;
            }else {
                    //source +=` -s $prev/.. -t elem -n Condition -v "select case when 0=(	select count(*) from Event where ProjectID = [##Field.ProjectID##] and (parenteventID is null or parenteventID=[##Field.ParentEventID##])  and Done=0) then 'true' else 'false' END"^\n`;
                    source+=` -s $prev/.. -t elem -n Condition -v "select case when 0=(select count(*) from Event where ProjectID = '[##Field.ProjectID##]' and parenteventID = (select top 1 EventID from event where ObjectType=(select ObjectType from event where EventID='[##Field.ParentEventID##]') and ProjectID='[##Field.ProjectID##]' order by enddate desc ) and Done=0) then 'true' else 'false' END"^\n`;
            }
//            }else {

  //          }
        }

        source+=` -s $prev -t attr -n type -v SQL^\n`;
        source+=` -s $prev/.. -t attr -n default -v false^\n`;
        source+=` -s $prev/.. -t attr -n return -v boolean^\n`;
     }


    source+=` -a /BusinessObject -t attr -n xmlns -v "http://effector.hu/schema/ns/businessobject" ^`;
    source+=` BusinessObject/`+name+`.xml`;
    return source;
}
function EFFFlow_BOP(name,table){ //BusinessObjectProject
    var source=`\necho ^<?xml version="1.0" encoding="ISO-8859-2"?^>^<BusinessObject/^> >BusinessObject/`+name+`.xml`;
    source+=`\nxml ed -L -s /BusinessObject -t elem -n ParentBusinessObject -v BusinessObjectProject`;
    source+=` -s /BusinessObject -t elem -n DataTable -v `+table.name;
    source+=` -s /BusinessObject -t elem -n UniqueIDColumn -v U_ProjectID`;
    source+=` -s /BusinessObject -t elem -n Fields`;
    source+=` -s /BusinessObject/Fields -t elem -n Field -a /BusinessObject/Fields/Field[last()] -t attr -n name -v U_ProjectID`;
    for (let i = 0; i < table.AFields.length; i++) {
        const f = table.AFields[i];
        if (f.name!='id'){
            source+=` -s /BusinessObject/Fields -t elem -n Field -a /BusinessObject/Fields/Field[last()] -t attr -n name -v `+f.name;
        }
    }    
    source+=` -a /BusinessObject -t attr -n xmlns -v "http://effector.hu/schema/ns/businessobject" ^`;
    source+=` BusinessObject/`+name+`.xml`;
    return source;
}


function EFFFlow_FEE(name,table){  //fragment event
    var source=`\necho ^<?xml version="1.0" encoding="ISO-8859-2"?^>^<Fragment/^> >EditForm/`+name+`.xml`;
    source+=`\nxml ed -L -s /Fragment -t elem -n Caption -v `+table.name;
    source+=` -s /Fragment -t elem -n BusinessObject -v BusinessObjectEvent.`+table.name;
    source+=` -s /Fragment -t elem -n DataDefinition -v DataDefinitionEventEdit`;
    source+=` -s /Fragment -t elem -n ControlGroups`;
    source+=` -s /Fragment -t elem -n ControlGroupOrders`;
    source+=` -s /Fragment/ControlGroupOrders -t elem -n ControlGroupOrder -a $prev -t attr -n isAutomatic -v False`;
    var orders="";
    for (let i = 0; i < table.AFields.length; i++) {
        const f = table.AFields[i];
        if (f.name!='id'){
            f.guid = getUUID();
            source+=` -s /Fragment/ControlGroups -t elem -n ControlGroup ^\n`;
            source+=` -a /Fragment/ControlGroups/ControlGroup[last()] -t attr -n name -v "`+f.guid+`" ^\n`;
            source+=` -s /Fragment/ControlGroups/ControlGroup[last()] -t elem -n Controls ^\n`;
            source+=` -s /Fragment/ControlGroups/ControlGroup[last()]/Controls -t elem -n Control ^\n`;
            r=getFieldname();
            source+=` -s $prev -t attr -n name -v "`+f.name+r+`"^\n`;
            source+=` -s $prev/.. -t elem -n Type -v Label^\n`;
            source+=` -s $prev/.. -t elem -n Name -v "`+f.name+r+`"^\n`;
            source+=` -s $prev/.. -t elem -n Caption -v "`+f.description+`"^\n`;
            source+=` -s $prev/.. -t elem -n Width -v 150^\n`;

            source+=` -s /Fragment/ControlGroups/ControlGroup[last()]/Controls -t elem -n Control ^\n`;
            source+=` -s $prev -t attr -n name -v "`+f.name+`"^\n`;
            source+=` -s $prev/.. -t elem -n Type -v `+AType[f.type].effectortype+`^\n`;
            source+=` -s $prev/.. -t elem -n Name -v "`+f.name+`"^\n`;
            source+=` -s $prev/.. -t elem -n BindingName -v "`+f.name+`"^\n`;
            source+=` -s $prev/.. -t elem -n Width -v 200^\n`;

            source+=` -s $prev/../../.. -t elem -n Rules^\n`;            
            source +=` -s /Fragment/ControlGroupOrders/ControlGroupOrder -t elem -n ControlGroup -v "`+f.guid+`" ^\n`;
        }
    }    
    
    source+=` -a /Fragment -t attr -n xmlns -v "http://effector.hu/schema/ns/editform" ^`
    source+=` EditForm/`+name+`.xml`;
    return source;
}
function EFFFlow_FEP(name,table){  //fragment project
    var source=`\necho ^<?xml version="1.0" encoding="ISO-8859-2"?^>^<Fragment/^> >EditForm/FragmentProject`+wfid+`.xml`;
    source+=`\nxml ed -L -s /Fragment -t elem -n Caption -v `+table.name;
    source+=` -s /Fragment -t elem -n BusinessObject -v BusinessObjectProject.`+wfid;
    source+=` -s /Fragment -t elem -n DataDefinition -v DataDefinitionProjectEdit`;

    source+=EFFFlow_FE_Core(table);

    source+=` -a /Fragment -t attr -n xmlns -v "http://effector.hu/schema/ns/editform" ^`
    source+=` EditForm/FragmentProject`+wfid+`.xml`;
    return source;
}

function EFFFlow_FE_Core(table){
    var source=` -s /Fragment -t elem -n ControlGroups`;
    source+=` -s /Fragment -t elem -n ControlGroupOrders`;
    source+=` -s /Fragment/ControlGroupOrders -t elem -n ControlGroupOrder -a $prev -t attr -n isAutomatic -v False`;
    var orders="";
    for (let i = 0; i < table.AFields.length; i++) {
        const f = table.AFields[i];
        if (f.name!='id'){
            f.guid = getUUID();
            source+=` -s /Fragment/ControlGroups -t elem -n ControlGroup ^\n`;
            source+=` -a /Fragment/ControlGroups/ControlGroup[last()] -t attr -n name -v "`+f.guid+`" ^\n`;
            source+=` -s /Fragment/ControlGroups/ControlGroup[last()] -t elem -n Controls ^\n`;
            source+=` -s /Fragment/ControlGroups/ControlGroup[last()]/Controls -t elem -n Control ^\n`;
            r=getFieldname();
            source+=` -s $prev -t attr -n name -v "`+f.name+r+`"^\n`;
            source+=` -s $prev/.. -t elem -n Type -v Label^\n`;
            source+=` -s $prev/.. -t elem -n Name -v "`+f.name+r+`"^\n`;
            source+=` -s $prev/.. -t elem -n Caption -v "`+f.description+`"^\n`;
            source+=` -s $prev/.. -t elem -n Width -v 150^\n`;

            source+=` -s /Fragment/ControlGroups/ControlGroup[last()]/Controls -t elem -n Control ^\n`;
            source+=` -s $prev -t attr -n name -v "`+f.name+`"^\n`;
            source+=` -s $prev/.. -t elem -n Type -v `+AType[f.type].effectortype+`^\n`;
            source+=` -s $prev/.. -t elem -n Name -v "`+f.name+`"^\n`;
            source+=` -s $prev/.. -t elem -n BindingName -v "`+f.name+`"^\n`;
            source+=` -s $prev/.. -t elem -n Width -v 200^\n`;

            source+=` -s $prev/../../.. -t elem -n Rules^\n`;            
            source +=` -s /Fragment/ControlGroupOrders/ControlGroupOrder -t elem -n ControlGroup -v "`+f.guid+`" ^\n`;
        }
    }  
    return source;  
}

//tablename minden átlakítás nélkül használódik
function EFFWorkflowSQL(linknode,ver){ 
    if (ATables==null) return;
    var dbname="";
    try { dbname=document.getElementById("title").value; } catch (error) {};
    var ifex="";
    var ifnex="";
    if (ver>0) {
      ifex='IF EXISTS ';
      ifnex='IF NOT EXISTS ';
    }
      
    linknode=document.getElementById(linknode);
    
    var dbproject= document.getElementById("dbproject").value;
    if (dbproject=="") dbproject=dbname;
    var source='';
    var drop=`delete from [dbo].[FSYS_ObjectTypesLookup] where objecttype like '`+dbproject+`%'`+LFGO;

    ATables.forEach(function(table,index){
      if ((!table.readonly) && (TWFLink.hasFlow(table))) {
        //source+=`DROP TABLE `+ifex+` [dbo].[`+table.name+`]`+LFGO; 
        drop+=`DROP TABLE [dbo].[`+table.name+`]`+LFGO;
        source+=`CREATE TABLE [dbo].[`+table.name+`] (`+LF;
        var fields="";        
        table.AFields.forEach(function(field,index2){   
          var fin=field.name;
          tip= AType.SearchTypeById(field.type);
          if (fin.toLowerCase()=="id") {
              if (table.properties.Get("wfstart")){ // (table.name.endsWith('start')){
                fin = 'U_ProjectID';
              } else {
                fin = 'U_EventID';
              }
              tip = AType.SearchTypeById(1);
          } 
          if (fin.toLowerCase()=="deleted"){
            fin="Deleted";
          }
          source+='['+fin+'] '+tip.mssql.replace("%",field.length)+','+LF ;
          fields+='['+fin+'],';
          
        });
        fields=fields.substring(0,fields.length-1);
        source=source.substring(0,source.length-3)+LF; //utolso vesszo
        source+=`) `+LFGO ;
        if (false){
          if (table.Records!=null && table.Records.length>1){
            //source+=`SET IDENTITY_INSERT [dbo].[`+table.name+`] ON `+LF;
            source+=`INSERT INTO [dbo].[`+table.name+`] (`+fields+`) VALUES `;
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
            source=source.substring(0,source.length-1)+LF;
          }
          //source+=`SET IDENTITY_INSERT [dbo].[`+table.name+`] OFF `+LF;
        }
      }
    });
    //Autoinc primary key
    
    
    for (let i = 0; i < ATables.length; i++) {
        const t = ATables[i];
        if ((TWFLink.hasFlow(t)) ){
            if (t.properties.Get("wfstart")){ //(t.name.endsWith("start")){
                source+=`INSERT INTO [dbo].[FSYS_ObjectTypesLookup] (ObjectType,ParentObject,DisplayLabel,Deleted) VALUES (`;
                source+=`N'`+dbproject+`',N'Project',N'`+t.name+`',N'0')`+LFGO;
            }else{
                source+=`INSERT INTO [dbo].[FSYS_ObjectTypesLookup] (ObjectType,ParentObject,DisplayLabel,Deleted) VALUES (`;
                source+=`N'`+t.name+`',N'Event',N'`+t.name+`',N'0')`+LFGO;
            }
        }
    }
    source=`USE `+dbname+LFGO+`BEGIN TRAN`+LFGO+drop+LF+source+LF;
    source += 'COMMIT TRAN;'+LF ;
    var url = "data:application/sql;charset=utf-8,"+encodeURIComponent(source);
    linknode.href = url;
    //linknode.style.visibility="visible";
    linknode.setAttribute("download","flowdbeffms.sql");
    linknode.innerHTML="RightClickforDownloadSQL";
    linknode.click();
  }



//search = msk_kex
function EFFMSSQL(linknode,ver,searchstring=""){ //search is "" = all tables , not null = begining with
    if (searchstring==""){
        searchstring=document.getElementById("dbproject").value;
    }

    if (ATables==null) return;
    try { SQLdb=document.getElementById("title").value; } catch (error) {};
    var ifex="";
    var ifnex="";
    if (ver>0) {
      ifex='IF EXISTS ';
      ifnex='IF NOT EXISTS ';
    }
      
    linknode=document.getElementById(linknode);
    var source=`USE `+SQLdb+LFGO+`BEGIN TRAN`+LFGO;
  
    ATables.forEach(function(table,index){
      if ((!table.readonly) && ( table.name.startsWith(searchstring))) {
        //source+=`DROP TABLE `+ifex+` [dbo].[`+table.name+`]`+LFGO; 
        source+=`CREATE TABLE [dbo].[`+table.name+`] (`+LF;
        var fields="";        
        table.AFields.forEach(function(field,index2){   
          var fin=field.name;
          if (fin.toLowerCase()=="id") {
            fin=table.name+"ID"
          } 
          if (fin.toLowerCase()=="deleted"){
            fin="Deleted";
          }
          
          tip= AType.SearchTypeById(field.type);
          source+='['+fin+'] '+tip.mssql.replace("%",field.length)+','+LF ;
          fields+='['+fin+'],';
          
        });
        fields=fields.substring(0,fields.length-1);
        source=source.substring(0,source.length-3)+LF; //utolso vesszo
        source+=`) `+LFGO ;
        if (false){
          if (table.Records!=null && table.Records.length>1){
            //source+=`SET IDENTITY_INSERT [dbo].[`+table.name+`] ON `+LF;
            source+=`INSERT INTO [dbo].[`+table.name+`] (`+fields+`) VALUES `;
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
            source=source.substring(0,source.length-1)+LF;
          }
          //source+=`SET IDENTITY_INSERT [dbo].[`+table.name+`] OFF `+LF;
        }
      }
    });
    //Autoinc primary key  
    source += 'COMMIT TRAN;'+LF ;
    var url = "data:application/sql;charset=utf-8,"+encodeURIComponent(source);
    linknode.href = url;
    //linknode.style.visibility="visible";
    linknode.setAttribute("download","flowdbeffms_all.sql");
    linknode.innerHTML="RightClickforDownloadSQL";
    linknode.click();
  }


function getFieldname(){
    //return "1001";
    return Math.floor(Math.random() * 20000)+10000;
}


function getUUID_2() { //not real!!!
    var d = new Date().getTime();
    var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*10)%10 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function getUUID() { //not real!!!
    
    return "1234"+getFieldname();
}

function getUUID_orig() { //not real!!!
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};


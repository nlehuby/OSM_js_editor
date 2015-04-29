/*
 OpenBeerMap OSM_js_editor.js | noemie.lehuby(at)gmail.com | MIT Licensed
*/

//les fonctions de manipulation de l'API OSM sont dans OSMAPI.js

function init_form_from_OSM(form,OSM_id) { 
//fonction d'affichage des info OSM dans le formulaire
    
        //affichage des bandeaux d'avertissement
        if (auth.authenticated())
        { 
            document.getElementById('alert_no_auth').style.display = 'none';
            document.getElementById('alert_auth').style.display = 'block';        
        }
        else
        {
            document.getElementById('alert_auth').style.display = 'none';
            document.getElementById('alert_no_auth').style.display = 'block';
        }

        // récupération des valeurs actuelles 
        OSM_xml = get_node_or_way(OSM_id, "node")
        name_src = get_tag(OSM_xml,"name") ; if (name_src == "undefined" ) {name_src = ""}  ;   
        opening_src = get_tag(OSM_xml,"opening_hours") ; if (opening_src == "undefined") {opening_src = ""}; 
        wifi_src = get_tag(OSM_xml,"internet_access").toLowerCase()
        
        //écriture des valeurs dans le formulaire
        // id du node, pour pouvoir soumettre le formulaire plus tard
        document.getElementById('OSM_id').value = OSM_id
        // nom du bar
        document.getElementById('bar-name').value = name_src
        // horaires d'ouverture
        document.getElementById('opening_hours').value = opening_src 
     
		//lien iD tout en bas du formulaire
		document.getElementById("singlelink").href = "http://www.openstreetmap.org/edit?editor=id&node="+ OSM_id.toString() 
        //tout le reste
        var inputForm = form.getElementsByTagName("input"); // récupération ds éléments de type input du formulaire
        var n = inputForm.length;
        for (i=0; i<n; i++)
                {
                
               if ( (inputForm[i].type.toLowerCase()==="radio") && (inputForm[i].name ==="wifi"))  
                        {
                        if ((wifi_src === "wlan") || (wifi_src === "yes") ) {if (inputForm[i].value === "wlan") {inputForm[i].checked = true}}
                        if (wifi_src === "undefined") {if (inputForm[i].value === "unknown") {inputForm[i].checked = true}}
                        if (wifi_src === "no") {if (inputForm[i].value === "no") {inputForm[i].checked = true}}
                        }
               } 
        
    	//post-processing éventuel
       	
        };

function form_from_user(form) {
//fonction de récupération des valeurs saisies et d'envoi de ces infos à OSM
         
        // récupération des valeurs actuelles       
        OSM_id = document.getElementById('OSM_id').value
        OSM_xml = get_node_or_way(OSM_id, "node")
        
        // récupération des valeurs saisies dans le formulaire
        var name = document.getElementById('bar-name').value
        var opening = document.getElementById('opening_hours').value
        var inputForm = form.getElementsByTagName("input"); 
        var n = inputForm.length;
        for (i=0; i<n; i++)
                {                       
                //traitement des cases à cocher pour le wifi
               if ( (inputForm[i].type.toLowerCase()==="radio") && (inputForm[i].name ==="wifi"))  
                        {
                        if (inputForm[i].checked) {var wifi = inputForm[i].value} ;
                        }
                }
                
             
        var envoi = 0   

        //TODO : il y a des envois vides à OSM ; refacto à prévoir ici
        if (wifi != get_tag(OSM_xml,"internet_access") ) 
        {
            if (wifi == "unknown") {del_tag(OSM_xml,"internet_access");envoi=4} 
            else {edit_tag(OSM_xml,"node","internet_access", wifi); envoi = 3}
        }
        if ((name != get_tag(OSM_xml,"name")) && (name != "")) {edit_tag(OSM_xml,"node", "name", name); envoi = 5}
        //si nom est vide mais qu'avant il y avait qqch, il faut supprimer le tag
        else {if ((get_tag(OSM_xml,"name") != "non_fourni") && (name == "")) {del_tag(OSM_xml, "name"); envoi = 6}}
    
        /*
        if ((opening != get_tag(OSM_xml,"opening_hours")) && (opening != "")) {edit_tag(OSM_xml,"node", "opening_hours", opening); envoi = 1}

        */
    
    	//envoi à OSM
    	console.log(envoi)
        if (envoi != 0)
                {
                    if (auth.authenticated())
                    { 
                        //open a changeset with oauth
                        var xml_changeset = "<osm><changeset><tag k='created_by' v='OpenBeerMap javascript editor'/><tag k='comment' v='OSM js editor - test, developpement'/></changeset></osm>";                        
                        auth.xhr(
                            {
                                method: 'PUT',
                                path: '/api/0.6/changeset/create', 
                                options: { header: { 'Content-Type': 'text/xml' } }, 
                                content: xml_changeset 
                            },
                            function(err, res){
                                if (err) {
                                    console.log('ERROR on put changeset: ' + err.response);
                                    return
                                    }
                                    
                                //prepare put node/way 
                                changeset_id = res;                                   
                                data_to_send = prepare_put_node_or_way(OSM_xml, changeset_id, OSM_id, "node")
                                
                                //put new node/ way
                                auth.xhr(
                                    {
                                        method: 'PUT',
                                        path: '/api/0.6/' + 'node' + '/' + OSM_id, 
                                        options: { header: { 'Content-Type': 'text/xml' } }, 
                                        content: data_to_send 
                                    },
                                    function(err, res){
                                        if (err) {
                                            console.log('ERROR on put node/way : ' + err.response);
                                            return
                                            }
                                            
                                        //close changeset 
                                        auth.xhr(
                                            {
                                                method: 'PUT',
                                                path: '/api/0.6/changeset/' + changeset_id + '/close',  
                                            },
                                            function(err, res){
                                                if (err) {
                                                    console.log('ERROR on put changeset/close : ' + err.response);
                                                    return
                                                    }
                                                else {console.log("Successfully modification of an OSM object !")}
                                            }//end of callback - close changeset
                                        );
                                    }//end of callback - put node/way
                                );
                                } //end of callback - open changeset
                        );
                    }
                    else
                    {
                        //ouvrir un changeset
                        changeset_id = put_changeset()
                        if (changeset_id != "Couldn't authenticate you")
                            {
                            //envoyer le nouveau node
                            put_node_or_way(OSM_xml, changeset_id, OSM_id, "node")
                            
                            //fermer le changeset
                            close_changeset(changeset_id);
                            }
                        else {console.log("auth fail")}
                    }
                

                }
    
        //post-processing éventuel
        
        };
        

function prepare_put_node_or_way(xml, changeset_id, id, OSM_type)
{
    if(OSM_type != "way" && OSM_type != "node")
    {
        console.log("ERROR: wrong OSM type: " + OSM_type);
        return false;
    }
    
    var tags = xml.documentElement.getElementsByTagName(OSM_type);
    console.log("current changeset: " + tags[0].getAttribute('changeset') + ", changing to " + changeset_id)
    tags[0].setAttribute('changeset', changeset_id); 
       
    /*
    var tags = xml.documentElement.getElementsByTagName("tag");    	
    for (var i in tags)
    {
        console.log(tags[i].getAttribute("k") + " : " + tags[i].getAttribute("v"));
    }*/
    
    
    var serialized = xml_to_string(xml);
    if(serialized !== false) { return serialized;}
}

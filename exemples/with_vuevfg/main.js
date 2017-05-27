var osm_object = {
    name: "Veuillez patentiez, on recherche les informations de cet objet"
};

var initial_osm_object = {};

init_form_with_osm_values();
// apparemment, il vaut mieux faire l'initalisation de l'objet avant la définition de la vm

var VueFormGenerator = window.VueFormGenerator;
var vm = new Vue({
    el: "#app",
    components: {
        "vue-form-generator": VueFormGenerator.component
    },
    data: {
        model: osm_object,
        schema: {
            fields: [{
                type: "input",
                inputType: "text",
                label: "Name",
                model: "name",
                readonly: false,
                featured: true,
                required: false,
                disabled: false,
                placeholder: "Nom de l'arrêt de bus",
                validator: VueFormGenerator.validators.string
            }, {
                type: "input",
                inputType: "text",
                label: "Note",
                model: "note",
                readonly: false,
                featured: false,
                required: false,
                disabled: false,
                placeholder: "Note",
                validator: VueFormGenerator.validators.string
            }, {
                type: "checklist",
                label: "Propriétés",
                model: "properties",
                featured: true,
                required: false,
                values: [{
                    value: "bench",
                    name: "Banc"
                }, {
                    value: "shelter",
                    name: "Abri"
                }, {
                    value: "wheelchair",
                    name: "Accessible en fauteuil roulant"
                }, {
                    value: "tactile_paving",
                    name: "Bande podotactile"
                }]
            }, {
                type: "submit",
                onSubmit: send_form_values_to_osm,
                buttonText: "Enregistrer",
                validateBeforeSubmit: false
            }, {
                type: "input",
                inputType: "hidden",
                model: "osm_id",
                readonly: false,
                featured: true,
                required: false,
                disabled: false,
                validator: VueFormGenerator.validators.int
            }, {
                type: "input",
                inputType: "hidden",
                model: "osm_type",
                readonly: true,
                featured: false,
                disabled: true
            }]
        },

        formOptions: {
            validateAfterLoad: true,
            validateAfterChanged: true
        }
    }
});



function init_form_with_osm_values() {
    osm_object.osm_id = 260743999;
    osm_object.osm_type = "node";

    var OSM_xml = get_node_or_way(osm_object.osm_id, osm_object.osm_type);

    var name_src = get_tag(OSM_xml, "name");
    if (name_src == "undefined") {
        name_src = ""
    };
    osm_object.name = name_src;

    var note_src = get_tag(OSM_xml, "note");
    if (note_src == "undefined") {
        note_src = ""
    };
    osm_object.note = note_src;

    osm_object.properties = [];
    if (get_tag(OSM_xml, "wheelchair") == "yes") {
        osm_object.properties.push("wheelchair")
    };
    if (get_tag(OSM_xml, "shelter") == "yes") {
        osm_object.properties.push("shelter")
    };
    if (get_tag(OSM_xml, "bench") == "yes") {
        osm_object.properties.push("bench")
    };
    if (get_tag(OSM_xml, "tactile_paving") == "yes") {
        osm_object.properties.push("tactile_paving")
    };

    initial_osm_object = (JSON.parse(JSON.stringify(osm_object)));
}

function send_form_values_to_osm() {
    if (osm_object.osm_type + osm_object.osm_id.toString() != initial_osm_object.osm_type + initial_osm_object.osm_id.toString()) {
        console.log("données corrompues, impossible de faire la modification");
        return
    }
    var OSM_xml = get_node_or_way(osm_object.osm_id, osm_object.osm_type);
    var osm_edit_needed = false;

    if (osm_object.name != initial_osm_object.name) {
        osm_edit_needed = true;
        if (osm_object.name == "") {
            console.log("il faut supprimer le nom");
            del_tag(OSM_xml, "name");
        } else {
            console.log("il faut changer le nom");
            edit_tag(OSM_xml, osm_object.osm_type, "name", osm_object.name);
        }
    }
    if (osm_object.note.toString() != initial_osm_object.note.toString()) {
        osm_edit_needed = true;
        if (osm_object.note == "") {
            console.log("il faut supprimer la note");
            del_tag(OSM_xml, "note");
        } else {
            console.log("il faut changer la note");
            edit_tag(OSM_xml, osm_object.osm_type, "note", osm_object.note);
        }
    }
    if (osm_object.properties.join("|%%|") != initial_osm_object.properties.join("|%%|")) {
        osm_edit_needed = true;
        console.log("il y a du changement dans les propriétés")
        if (include(osm_object.properties, "bench") && !include(initial_osm_object.properties, "bench")) {
            //si on l'a maintenant et pas avant, on l'ajoute
            console.log("il faut ajouter le banc");
            edit_tag(OSM_xml, osm_object.osm_type, "bench", "yes");
        }
        if (!include(osm_object.properties, "bench") && include(initial_osm_object.properties, "bench")) {
            //si on ne l'a plus maintenant mais qu'on l'avant avant, on le supprime
            console.log("il faut supprimer le banc");
            edit_tag(OSM_xml, osm_object.osm_type, "bench", "no");
        }
        if (include(osm_object.properties, "wheelchair") && !include(initial_osm_object.properties, "wheelchair")) {
            console.log("il faut ajouter le tag wheelchair");
            edit_tag(OSM_xml, osm_object.osm_type, "wheelchair", "yes");
        }
        if (!include(osm_object.properties, "wheelchair") && include(initial_osm_object.properties, "wheelchair")) {
            console.log("il faut supprimer le tag wheelchair");
            edit_tag(OSM_xml, osm_object.osm_type, "wheelchair", "no");
        }
        if (include(osm_object.properties, "shelter") && !include(initial_osm_object.properties, "shelter")) {
            console.log("il faut ajouter le tag shelter");
            edit_tag(OSM_xml, osm_object.osm_type, "shelter", "yes");
        }
        if (!include(osm_object.properties, "shelter") && include(initial_osm_object.properties, "shelter")) {
            console.log("il faut supprimer le tag shelter");
            edit_tag(OSM_xml, osm_object.osm_type, "shelter", "no");
        }
        if (include(osm_object.properties, "tactile_paving") && !include(initial_osm_object.properties, "tactile_paving")) {
            console.log("il faut ajouter le tag tactile_paving");
            edit_tag(OSM_xml, osm_object.osm_type, "tactile_paving", "yes");
        }
        if (!include(osm_object.properties, "tactile_paving") && include(initial_osm_object.properties, "tactile_paving")) {
            console.log("il faut supprimer le tag tactile_paving");
            edit_tag(OSM_xml, osm_object.osm_type, "tactile_paving", "no");
        }
    }

    if (osm_edit_needed) {
        send_data_to_osm(OSM_xml, osm_object.osm_id, osm_object.osm_type)
    }
}

function include(arr, obj) {
    return (arr.indexOf(obj) != -1);
}

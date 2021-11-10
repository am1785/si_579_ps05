const word_input = document.getElementById('word_input');
const show_rhymes_btn = document.getElementById('show_rhymes');
const show_synonyms_btn = document.getElementById('show_synonyms');
const output_desc = document.getElementById('output_description');
const output = document.getElementById('word_output');
const saved_words = document.getElementById('saved_words');
const output_parent_node = output.childNodes[0].parentNode;


let current_func = 0; // for enter key down functionality
let saved_words_len = 0;

saved_words.textContent = "";

function getRhymes(rel_rhy, callback) {
    output.textContent = "loading..."; // display loading while the data is being fetched
    fetch(`https://api.datamuse.com/words?${(new URLSearchParams({rel_rhy})).toString()}`)
        .then((response) => response.json())
        .then((data) => {
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

function getSynonyms(rel_syn, callback) {
    output.textContent = "loading...";
    fetch(`https://api.datamuse.com/words?${(new URLSearchParams({rel_syn})).toString()}`)
        .then((response) => response.json())
        .then((data) => {
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

function createOutput(word_list) {
    const ul_node = document.createElement('ul');
    output.appendChild(ul_node);

    for(let i = 0; i < word_list.length; i++){
        const li_node = document.createElement('li');
        const li_text = document.createTextNode(word_list[i] + " ");

        ul_node.appendChild(li_node);
        li_node.appendChild(li_text);

        if (word_list[0] != "no result."){
        const btn_node = document.createElement('button');
        const btn_text = document.createTextNode('(save)');
        btn_node.className = "btn btn-outline-success";
        btn_node.addEventListener('click', ()=>{
            if(saved_words_len > 0){
                var saved_text = document.createTextNode(', ' + word_list[i]);
            } else{
                var saved_text = document.createTextNode(word_list[i]);
            }
            saved_words.appendChild(saved_text);
            saved_words_len = saved_words.childNodes.length;
        });

        btn_node.appendChild(btn_text);
        li_node.append(btn_node);
        }
        }
}

function displayWords(json_data) {
    /**
    * @param {json[]} json_data: An array of json objects
    * @returns  None
    */
    let rhyme_words = [];
    // for(i in json_data){
    //     rhyme_words.push(json_data[i]['word']);
    // };
    if (json_data.length === 0){
        rhyme_words = ['no result.'];
        createOutput(rhyme_words);
    }

    else {

    let grouped_json_data = groupBy(json_data, "numSyllables");

    // if(!rhyme_words){
    //     rhyme_words = ['no results'];
    // };

    for(const i in grouped_json_data){
        rhyme_words = [];
        for(const j in grouped_json_data[i]){
            rhyme_words.push(grouped_json_data[i][j]['word']);
        }
        const h2_node = document.createElement('h2');
        h2_node.textContent = `${grouped_json_data[i][0]['numSyllables']} Syllables:`;
        output.appendChild(h2_node);
        createOutput(rhyme_words);
        }
    };

    // remove Syllable headers if get synonyms function is invoked
    if(current_func === 1 && document.querySelector('output h2')){output.removeChild(document.querySelector('output h2'));}
};

show_rhymes_btn.addEventListener('click', ()=>{
    current_func = 0;
    output_desc.textContent = `Words that rhyme with ${word_input.value}`;
    getRhymes(word_input.value, displayWords);
    output.textContent = "";
    });

show_synonyms_btn.addEventListener('click', ()=>{
    current_func = 1;
    output_desc.textContent = `Words that have similar meanings to ${word_input.value}`;
    getSynonyms(word_input.value, displayWords)
    output.textContent = "";
    });

word_input.addEventListener("keydown", (event) =>{
    switch(event.key){
        case "Enter":
            if (current_func === 0) {
            output_desc.textContent = `Words that rhyme with ${word_input.value}`;
            getRhymes(word_input.value, displayWords);
            output.textContent = "";
            } else {
            output_desc.textContent = `Words that have similar meanings to ${word_input.value}`;
            getSynonyms(word_input.value, displayWords);
            output.textContent = "";
            };
    };
});

/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// remove trailing comma
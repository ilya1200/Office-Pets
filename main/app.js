const welcome = document.getElementById("welcome");
const main = document.getElementById("main");
const list = document.getElementById("list");
const button = document.getElementById("add-item");
const errorMsg = document.getElementById("list-error-msg");

const enmStatus = {
    ALL: 'all',
    IN: 'in',
    OUT: 'out'
}

class App {
    constructor() { } // set the app

    init() {
        this.loadData();
        setTimeout(() => { this.redirect() }, 2500);
    }

    loadData() {
        const calls = 10;
        for(let i=0;i<calls;i++){
            this.fetchData()
        }
    }

    redirect() {
        welcome.style.display = "none";
        main.style.display = "block";
    }

    fetchData(status = enmStatus.OUT) {
        const dogAPI = "https://dog.ceo/api/breeds/image/random";
        const namesAPI = "https://randomuser.me/api/?inc=name&nat=us,dk,fr,gb";
        const corsHeader = {
            headers:{
                "Access-Control-Allow-Origin": "*"
            }
        }

        const newItem = {};

        Promise.all([fetch(dogAPI)
                .then(response => response.json())
                .then(data => data.message)
            , fetch(namesAPI)
                .then(response => response.json())
                .then(data => data.results[0].name.first)]
        ).then( result => {
            newItem.url = result[0],
            newItem.name = result[1]
            listManager.generateListItem(newItem.name,newItem.url,newItem.name,status)
        }).catch(error => console.log('Looks like there was a problem!', error))
    }
}

class ListManager {

    constructor(list) {
        this.list = list;
        this._showMode = enmStatus.ALL;
    }
    get showMode() {
        return this._showMode;
    }

    set showMode(showMode) {
        this._showMode = showMode;
        this.shiftShowMode(showMode);
    }

    toggleItemState(listItem) {
        const statusIN = enmStatus.IN;
        const statusOUT = enmStatus.OUT;

        if (listItem.classList.contains(statusIN)) {
            listItem.classList.remove(statusIN);
            listItem.classList.add(statusOUT);
        } else {
            listItem.classList.remove(statusOUT);
            listItem.classList.add(statusIN);
        }
        this.shiftShowMode(this.showMode);
    }

    shiftShowMode(showMode) {
        this.resetListError();
        let itemsRemainedInShowMode = list.children.length;

        for (let listItem of list.children) {
            if (showMode === enmStatus.ALL) {
                listItem.style.display = "block";
            } else {
                const display = listItem.classList.contains(showMode) ? "block" : "none";
                listItem.style.display = display;

                //Count how many items ramined after filtering
                if (display === "none") {
                    itemsRemainedInShowMode--;
                }
            }
        }

        if (itemsRemainedInShowMode < 1) {
            this.issueListError("No Items");
        }
    }

    issueListError(msg) {
        this.resetListError();

        // Display error message
        errorMsg.style.display = "block";
        errorMsg.innerHTML = `<h1>* ${msg} *</h1>`;
    }

    resetListError() {
        // Hide error message
        errorMsg.innerHTML = "";
    }

    generateListItem(itemName = "unknown", src, alt, itemStatus = enmStatus.OUT) {
        this.resetListError();
        const listItem =
            `                
            <li class="list-item ${itemStatus}">
                <img class="item-img"
                    src=${src}
                    alt=${alt}>
                <div class="overlay">
                    <span class="item-name">${itemName}</span>
                </div>
            </li>
        `;

        this.list.innerHTML += listItem;
    }
}




/**
 *  This Toggles a list-items state, on a list-item click.
 */
list.addEventListener("click", (event) => {
    let listItem = event.target;

    if ((!listItem.classList.contains('list-item') &&
        listItem.parentNode.classList.contains('list-item'))) {
        listItem = listItem.parentNode;
    }

    if (listItem.classList.contains('list-item')) {
        listManager.toggleItemState(listItem);
    }
});



/**
 * Change display-mode on tab click.
 */
main.addEventListener("click", (event) => {
    const target = event.target;
    if (target.className !== "tab") {
        return;
    }

    listManager.showMode = enmStatus[target.id.toUpperCase()];
})

button.addEventListener("click", () => {
    const newItem = {};

    // GET INPUT
    const name = prompt("Add a Pet name: ");
    const url = prompt("Add a Pet url: ");
    let status = prompt("Add status: (in/out - dafault)");

    // Validate INPUT
    if (!name || !url) {
        listManager.issueListError(`Cannot add ,check url/name`);
        return;
    }

    if (!status || status != enmStatus.IN) {
        status = enmStatus.OUT;
    }

    // Set new Item
    newItem.name = name;
    newItem.imageURL = url;
    newItem.status = status;

    // Add new Item to DB

    //Update UI
    listManager.generateListItem(name, url, name, status);
})

const listManager = new ListManager(list);
const app = new App();
app.init();

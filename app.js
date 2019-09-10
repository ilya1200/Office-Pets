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
        const results = 10;
        this.fetchData(results)
    }

    redirect() {
        welcome.style.display = "none";
        main.style.display = "block";
    }

    fetchData(results) {
        function checkStatus(response) {
            if (response.ok) {
                return Promise.resolve(response);
            } else {
                return Promise.reject(new Error(response.statusText));
            }
        }

        function setInitStatus() {
            const low = 0;
            const high = 1;

            const result = randNumber(0, 1);
            if (result === 1) {
                return enmStatus.IN;
            } else {
                return enmStatus.OUT;
            }
        }

        function randNumber(lower, upper) {
            return Math.floor(Math.random() * (upper - (lower) + 1)) + (lower);
        }

        const dogAPI = `https://dog.ceo/api/breeds/image/random/${results}`;
        const namesAPI = `https://randomuser.me/api/?inc=name&nat=us,dk,fr,gb&results=${results}`;



        function fetchUrls() {
            return fetch(dogAPI)
                .then(checkStatus)
                .then(response => response.json())
                .then(data => (data.message).map(url => { return { url } }))
                .catch(error => console.log('There was a problem to fetch Items!', error))
        };

        function fetchNames() {
            return fetch(namesAPI)
                .then(checkStatus)
                .then(response => response.json())
                .then(data => (data.results).map(nameObj => { return { name: nameObj.name.first } }))
                .catch(error => console.log('There was a problem to fetch Names!', error))
        };


        Promise.all([fetchUrls(), fetchNames()])
            .then(data => {
                const urls = data[0];
                const names = data[1];

                const items = [];

                for (let i = 0; i < urls.length; i++) {
                    const name = names[i].name;
                    const url = urls[i].url;
                    const status = setInitStatus();

                    const newItem = {
                        name,
                        url,
                        status
                    };
                    items.push(newItem);// TODO : Should be stored?
                    listManager.generateListItem(newItem.name, newItem.url, newItem.status)
                }
            }).catch(error => listManager.issueListError("There was a problem Loading the data..."))
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

    generateListItem(itemName = "unknown", src = "", itemStatus = enmStatus.OUT) {
        this.resetListError();
        const listItem =
            `                
            <li class="list-item ${itemStatus}">
                <img class="item-img"
                    src=${src}
                    alt=${itemName}>
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
    newItem.url = url;
    newItem.status = status;

    // Add new Item to DB

    //Update UI
    listManager.generateListItem(newItem.name, newItem.url, newItem.status);
})

const listManager = new ListManager(list);
const app = new App();
app.init();

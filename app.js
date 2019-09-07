

const main = document.getElementById("main");
const list = document.getElementById("list");
const button = document.getElementById("add-item");

class App {
    constructor() { // set the app
        this.app = document.getElementById("app");
        this.welcome = document.getElementById("welcome");
        this.main = document.getElementById("main");
        this.showMode = "all";
    }

    init() {
        setTimeout(() => { this.loadData() }, 3000);
        //ToDo 

        //2. Create a dammyDB 

        //3. Issue server get data request

        //4. Generate HTML
    }

    loadData() {
        console.log("Data loaded");
        this.redirect();
    }

    redirect() {
        this.welcome.style.display = "none";
        this.main.style.display = "block";
    }
}

class ListManager {
    constructor(list) {
        this.list = list;
    }

    toggleItemState(listItem) {
        if (listItem.classList.contains('in')) {
            listItem.classList.remove('in');
            listItem.classList.add('out');
        } else {
            listItem.classList.remove('out');
            listItem.classList.add('in');
        }
    }

    shiftShowMode(showMode) {
        this.resetListError();
        let itemsRemainedInShowMode = list.children.length;

        for (let listItem of list.children) {
            if (showMode === "all") {
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
        const errorMsg = document.getElementById("list-error-msg");
        this.resetListError();

        // Display error message
        errorMsg.style.display = "block";
        errorMsg.innerHTML = `<h1>* ${msg} *</h1>`;
    }

    resetListError() {
        const errorMsg = document.getElementById("list-error-msg");
        // Hide error message
        errorMsg.innerHTML = "";
    }

    generateListItem(itemStatus = "out",src, alt,itemName = "unknown" ){
        if(!src || !alt){
            return;
        }

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


const listManager = new ListManager(list);

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

    //ToDo: Issue status change
});



/**
 * Change display-mode on tab click.
 */
main.addEventListener("click", (event) => {
    const target = event.target;
    if (target.className !== "tab") {
        return;
    }

    const showMode = target.id;
    listManager.shiftShowMode(showMode);
})

button.addEventListener("click", () => {
    const name = prompt("Add a Pet name: ");
    const url = prompt("Add a Pet url: ");
    let status = prompt("Add status: (in/out - dafault)");

    if (!name || !url) {
        listManager.issueListError(`Cannot add ,check url/name`);
        return;
    }

    if(!status || status!="in"){
        status="out";
    }

    listManager.generateListItem(status,url,name,name);
    console.log(`${name} added`);
})


const app = new App();
app.init();
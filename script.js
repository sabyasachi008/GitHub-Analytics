
const searchBox = document.getElementById('searchbx');
let resultDiv = document.getElementById('result');

//Required for displaying the Repo section and it's sorting
let repoSection = document.getElementById("repoSection");
let searchSection = document.getElementById("searchSection");      

let repoResult = document.getElementById("repoResult");

let repos = [];
let sortBy = "";
let searchQuery = "";

let searchTimeout = null;

//this is applying Debugging in the search box -> the search re-searches after 500ms of typing in the search box
searchBox.addEventListener('input', () => {
    clearTimeout(searchTimeout);

    const query = searchBox.value.trim();

    if(!query) {
        resultDiv.innerHTML='';
        return;
    }

    searchTimeout = setTimeout(() => searchUser(query), 500);
})


async function searchUser(query) {
    try {
        // const res = await fetch(`http://api.github.com/search/users?q=${query}`);

        const res = await fetch(`https://api.github.com/search/users?q=${query}`);

        
        const data = await res.json();          //convert the fetched data to json format

        console.log(data);          //debugging

        if(!data.items) {
            
            console.log("API did not fetch items: ", data);

            resultDiv.innerHTML = "<p class='para'>No User found.</p>";            
            return;                 //incase of no response from the api
        }
        const users = data.items.slice(0, 100);          //limit to first 100 users only

        resultDiv.innerHTML = `
        <table class="table table-dark table-hover table-striped mt-3">
            <tr>
                <th>Avatar</th>
                <th>UserName</th>
                <th>Profile</th>
                <th>Type</th>
                <th>Repos</th>
            </tr>
           ${users.map(user => `
                <tr>
                    <td><img src="${user.avatar_url}" width="40" height="40"></td>
                    <td>${user.login}</td>
                    <td><a href="${user.html_url}" target="_blank"><i class="bi bi-github"></i></a></td>
                    <td>${user.type}</td>
                    <td><button class="btn btn-info" onclick="loadRepos('${user.login}')">View</button></td>
                </tr>
           `).join('')}
           </table>
           `;
    } catch (error) {
        console.log(error);
    }
}



async function loadRepos(username) {

    searchSection.style.display = "none";
    repoSection.style.display = "block";

    document.getElementById('repoTitle').innerText = 
    `Repositories of ${username}`;

    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`)

    repos = await res.json();   
    render();
}

document.querySelectorAll(".sort-option").forEach(item => {
    item.addEventListener("click", e=> {
        e.preventDefault();
        sortBy = item.dataset.sort;
        render();
    });
});

//to fetch the repos search input box value
document.getElementById("repoSearch").addEventListener("input", e=> {
    searchQuery = e.target.value.toLowerCase().trim();
    render();
})


function render() {

    let list = [...repos];

    if(searchQuery) {
        list = list.filter(r => r.name.toLowerCase().includes(searchQuery));
    }


    if(sortBy === 'name') {
        list.sort((a,b) => 
        a.name.localeCompare(b.name));
    }

    if(sortBy === 'stars') {
        list.sort((a,b) => b.stargazers_count - a.stargazers_count);
    }

    if(sortBy === 'forks') {
        list.sort((a,b) => b.forks - a.forks);
    }

    if(sortBy === 'issues') {
        list.sort((a,b) => b.open_issues - a.open_issues);
    }


    repoResult.innerHTML = `
    
        <table class="table table-dark table-hover table-striped mt-3">

            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Stars</th>
                <th>Forks</th>
                <th>Issues</th>
            </tr>
            ${list.map(r=> `
                <tr>
                    <td>${r.name}</td>
                    <td>${r.description || ""}</td>
                    <td>${r.stargazers_count}</td>
                    <td>${r.forks}</td>
                    <td>${r.open_issues}</td>
                </tr>
                `).join("")}
        </table>
    `;
}


//Back button

document.getElementById('backBtn').addEventListener("click", ()  =>{ 
    repoSection.style.display="none";
    searchSection.style.display = "block";
})
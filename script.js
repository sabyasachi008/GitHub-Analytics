let searchResult = document.getElementById("searchResult");
let searchBox = document.getElementById("searchbx");
let repoResult = document.getElementById("repoResult");

let searchSection = document.getElementById("searchSection");
let repoSection = document.getElementById("repoSection");

let repos = [];
let sortBy = "";
let searchQuery = "";

// SEARCH USERS
document.getElementById("searchBtn").addEventListener("click", e => {
  e.preventDefault();
  searchUser(searchBox.value.trim());
});

async function searchUser(query) {
  if (!query) return;

  const res = await fetch(`https://api.github.com/search/users?q=${query}`);
  const data = await res.json();

  if (!data.items) return;

  searchResult.innerHTML = `
    <table class="table table-dark table-striped mt-3">
      <tr>
        <th>Avatar</th>
        <th>Username</th>
        <th>Profile</th>
        <th>Repos</th>
      </tr>
      ${data.items.slice(0, 20).map(u => `
        <tr>
          <td><img src="${u.avatar_url}" width="40" class="rounded"></td>
          <td>${u.login}</td>
          <td><a href="${u.html_url}" target="_blank">GitHub</a></td>
          <td><button class="btn btn-info" onclick="loadRepos('${u.login}')">View</button></td>
        </tr>
      `).join("")}
    </table>
  `;
}

// LOAD REPOSITORIES
async function loadRepos(username) {

  // switch sections
  searchSection.style.display = "none";
  repoSection.style.display = "block";

  document.getElementById("repoTitle").innerText = `Repositories of ${username}`;

  const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
  repos = await res.json();

  renderRepos();
}

// SORT + SEARCH REPOSITORIES
document.querySelectorAll(".sort-option").forEach(item => {
  item.addEventListener("click", e => {
    e.preventDefault();
    sortBy = item.dataset.sort;
    renderRepos();
  });
});

document.getElementById("repoSearch").addEventListener("input", e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderRepos();
});

function renderRepos() {
  let list = [...repos];

  if (searchQuery) {
    list = list.filter(r => r.name.toLowerCase().includes(searchQuery));
  }

  if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "stars") list.sort((a, b) => b.stargazers_count - a.stargazers_count);
  if (sortBy === "forks") list.sort((a, b) => b.forks - a.forks);
  if (sortBy === "issues") list.sort((a, b) => b.open_issues - a.open_issues);

  repoResult.innerHTML = `
    <table class="table table-dark table-striped">
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Stars</th>
        <th>Forks</th>
        <th>Issues</th>
      </tr>
      ${list.map(r => `
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

// BACK BUTTON
document.getElementById("backBtn").addEventListener("click", () => {
  repoSection.style.display = "none";
  searchSection.style.display = "block";
});

let images = [];  // store all image URLs
let currentIndex = 0;

function loadPosts() {
  fetch('/api/posts')
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById('posts');
      container.innerHTML = "";
      images = posts.map(p => p.image || "https://via.placeholder.com/800x400?text=No+Image");
      
      posts.forEach((post, index) => {
        container.innerHTML += `
          <div class="post">
            <img src="${images[index]}" 
                 alt="Post image"
                 style="max-width:100%; border-radius:8px; margin-bottom:10px; cursor:pointer;"
                 onclick="openModal(${index})">
            <h2><a href="${post.link}" target="_blank">${post.title}</a></h2>
            <small>${new Date(post.date).toDateString()} — ${post.source}</small>
            <p>${post.description.substring(0, 200)}...</p>
          </div>
        `;
      });
    });
}

function openModal(index) {
  currentIndex = index;
  document.getElementById("modalImg").src = images[currentIndex];
  document.getElementById("imgModal").style.display = "block";
}

function changeImage(direction) {
  currentIndex += direction;
  if (currentIndex < 0) currentIndex = images.length - 1;
  if (currentIndex >= images.length) currentIndex = 0;
  document.getElementById("modalImg").src = images[currentIndex];
}

document.getElementById("closeModal").onclick = function() {
  document.getElementById("imgModal").style.display = "none";
};

window.onclick = function(event) {
  const modal = document.getElementById("imgModal");
  if (event.target === modal) modal.style.display = "none";
};

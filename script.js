document.addEventListener('DOMContentLoaded', function () {
    const blogContainer = document.getElementById('blog-container');
    const editorModal = document.getElementById('editorModal');
    const saveChangesButton = document.getElementById('saveChanges');
    const addButton = document.getElementById('addButton');
    const blogTitleInput = document.getElementById('blog-title');
  
    let currentEditId = null;
    let isEditing = false;
  
    // Function to save blogs to localStorage
    function saveBlogsToLocalStorage(blogs) {
      localStorage.setItem('blogs', JSON.stringify(blogs));
    }
  
    // Function to retrieve blogs from localStorage
    function getBlogsFromLocalStorage() {
      const storedBlogs = localStorage.getItem('blogs');
      return storedBlogs ? JSON.parse(storedBlogs) : [];
    }
  
    // Load blogs from localStorage on page load
    let blogs = getBlogsFromLocalStorage();
  
    function renderBlogs() {
      blogContainer.innerHTML = '';
      blogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.className = 'col-md-4 blog-card';
        blogCard.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title text-truncate">${blog.title}</h5>
              <br />
              <button class="btn btn-primary btn-sm view-btn px-2" data-id="${blog.id}">View</button>
              <button class="btn btn-secondary btn-sm edit-btn px-2" data-id="${blog.id}">Edit</button>
              <button class="btn btn-danger btn-sm delete-btn px-2" data-id="${blog.id}">Delete</button>
            </div>
          </div>
        `;
        blogContainer.appendChild(blogCard);
      });
    }
  
    blogContainer.addEventListener('click', function (event) {
      const id = event.target.getAttribute('data-id');
      if (event.target.classList.contains('edit-btn')) {
        isEditing = true;
        currentEditId = id;
        const blog = blogs.find(b => b.id == id);
        blogTitleInput.value = blog.title;
        quill.root.innerHTML = blog.content;
        $('#editorModalLabel').text('Edit Blog Post');
        $('#editorModal').modal('show');
      } else if (event.target.classList.contains('delete-btn')) {
        blogs = blogs.filter(b => b.id != id);
        saveBlogsToLocalStorage(blogs);
        renderBlogs();
      } else if (event.target.classList.contains('view-btn')) {
        window.location.href = `view.html?id=${id}`;
      }
    });
  
    saveChangesButton.addEventListener('click', function () {
      const updatedTitle = blogTitleInput.value;
      const updatedContent = quill.root.innerHTML;
      if (isEditing) {
        const editedBlogIndex = blogs.findIndex(b => b.id == currentEditId);
        if (editedBlogIndex !== -1) {
          blogs[editedBlogIndex].title = updatedTitle;
          blogs[editedBlogIndex].content = updatedContent;
        }
      } else {
        const newId = blogs.length ? Math.max(...blogs.map(b => b.id)) + 1 : 1;
        blogs.push({ id: newId, title: updatedTitle, content: updatedContent });
      }
      saveBlogsToLocalStorage(blogs);
      $('#editorModal').modal('hide');
      renderBlogs();
    });
  
    addButton.addEventListener('click', function () {
      isEditing = false;
      blogTitleInput.value = '';
      quill.root.innerHTML = '';
      $('#editorModalLabel').text('New Blog Post');
      $('#editorModal').modal('show');
    });
  
    // Initialize Quill editor with image upload, alignment, and font selection support
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: {
          container: [
            [{ 'font': [] }],
            ['bold', 'italic', 'underline'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            [{ 'align': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['clean']
          ],
          handlers: {
            image: imageHandler
          }
        }
      }
    });
  
    function imageHandler() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
  
      input.onchange = function () {
        const file = input.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const range = quill.getSelection();
            quill.insertEmbed(range.index, 'image', e.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
    }
  
    renderBlogs();
  });
  
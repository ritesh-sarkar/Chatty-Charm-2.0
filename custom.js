window.onload = function() {
  main();
}

function main() {
  // Variable part
  let avatar_image = document.querySelector('.default_avatar');
  let avatar_change_btn = document.querySelector('#change_avatar_btn');

  // Load the saved image from localStorage
  let savedImageUrl = localStorage.getItem('user_image_source');

  if (savedImageUrl) {
    avatar_image.src = savedImageUrl;
  }

  // Function to update the image
  const updateImageFunc = () => {
    const update_image_source = URL.createObjectURL(avatar_change_btn.files[0]);

    // Save the updated image URL to localStorage
    localStorage.setItem('user_image_source', update_image_source);

    // Update the image on the current page
    avatar_image.src = update_image_source;
  };

  avatar_change_btn.addEventListener('change', () => {
    if (avatar_change_btn.files[0]) {
      updateImageFunc();
    }
  });
}
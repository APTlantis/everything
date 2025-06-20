/*
 * #!/bin/bash
 * # If you're reading this, you're awesome!
 * # Try opening your browser console and typing:
 * # console.log(atob('QVBUbGFudGlzIGlzIHBvd2VyZWQgYnkgY29mZmVlLCBjdXJpb3NpdHksIGFuZCBhIGxvdmUgZm9yIExpbnV4'))
 */

document.addEventListener('DOMContentLoaded', () => {
  // Konami Code Easter Egg: Up, Up, Down, Down, Left, Right, Left, Right, B, A
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiCodePosition = 0;

  document.addEventListener('keydown', function(e) {
    // Get the key pressed
    const key = e.key.toLowerCase();

    // Get the expected key from the konami code
    const expectedKey = konamiCode[konamiCodePosition].toLowerCase();

    // Check if the key is correct
    if (key === expectedKey) {
      // Move to the next key in the sequence
      konamiCodePosition++;

      // If the konami code is complete
      if (konamiCodePosition === konamiCode.length) {
        // Reset the position
        konamiCodePosition = 0;

        // Do something cool
        document.body.style.backgroundImage = "url('https://aptlantis.net/assets/images/pistol-shrimp.png')";
        document.body.style.backgroundSize = "100px";
        alert("You found the Konami Code! Pistol Shrimp mode activated!");

        // Reset after 5 seconds
        setTimeout(() => {
          document.body.style.backgroundImage = "";
        }, 5000);
      }
    } else {
      // Reset position if wrong key is pressed
      konamiCodePosition = 0;
    }
  });

  const distro = window.location.pathname.split('/').pop().replace('.html', '');

  // Load Mirror Info
  fetch(`/data/${distro}.json`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("mirrorBox").innerHTML = `
        <ul>
          <li><strong>Last Sync:</strong> ${data.last_sync}</li>
          <li><strong>Frequency:</strong> ${data.frequency}</li>
          <li><strong>Status:</strong> ${data.status_icon} ${data.status}</li>
          <li><strong>Repo Size:</strong> ${data.repo_size}</li>
        </ul>
      `;
    })
    .catch(err => {
      document.getElementById("mirrorBox").innerText = "⚠️ Failed to load mirror info.";
    });

  // Chunked Renderer
  function renderFilesInChunks(files, container, batchSize = 100) {
    let index = 0;

    function processBatch() {
      const batch = files.slice(index, index + batchSize);
      batch.forEach(file => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${file.filename}</td>
          <td>${file.size}</td>
          <td>${file.arch}</td>
          <td><a href="/repos/${distro}/${file.filename}" target="_blank">Download</a></td>
        `;
        container.appendChild(row);
      });
      index += batchSize;

      if (index < files.length) {
        setTimeout(processBatch, 50); // Allow the browser to breathe
      }
    }

    processBatch();
  }

  // Load ISO Table with Chunked Rendering
  fetch(`/data/${distro}-file.json`)
    .then(res => res.json())
    .then(files => {
      const tbody = document.querySelector("#isoTable tbody");
      tbody.innerHTML = "";
      renderFilesInChunks(files, tbody, 100); // Adjust batch size as needed
    })
    .catch(err => {
      document.querySelector("#isoTable tbody").innerHTML =
        "<tr><td colspan='4'>⚠️ Failed to load ISO list.</td></tr>";
    });

  // Copy to Clipboard Functionality
  const copyButtons = document.querySelectorAll('.copy-button');

  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const rsyncAddress = button.getAttribute('data-rsync');
      if (rsyncAddress) {
        // Use Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(rsyncAddress)
            .then(() => {
              button.textContent = 'Copied!';
              setTimeout(() => {
                button.textContent = 'Copy to Clipboard';
              }, 2000); // Reset text after 2 seconds
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
              button.textContent = 'Failed to Copy';
              setTimeout(() => {
                button.textContent = 'Copy to Clipboard';
              }, 2000);
            });
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = rsyncAddress;
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            button.textContent = 'Copied!';
          } catch (err) {
            console.error('Fallback: Failed to copy text: ', err);
            button.textContent = 'Failed to Copy';
          }
          document.body.removeChild(textarea);
          setTimeout(() => {
            button.textContent = 'Copy to Clipboard';
          }, 2000);
        }
      } else {
        console.error('No rsync address found for this button.');
      }
    });
  });
});

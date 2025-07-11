(function() {
  // Prevent the script from running multiple times if the icon is clicked repeatedly.
  if (document.getElementById('support-modal-container')) {
    return;
  }

  // 1. Create the modal container and backdrop
  const modalContainer = document.createElement('div');
  modalContainer.id = 'support-modal-container';

  const modalHTML = `
    <div id="support-modal-backdrop"></div>
    <div id="support-modal">
      <button id="support-modal-close-btn" title="Close">×</button>
      
      <div class="modal-header">
        <h1>💬 Need Help? We're Here for You — 24/7 Support</h1>
        <p>Have a question or need assistance? Our dedicated support team is available around the clock to help you with any technical issues.</p>
      </div>

      <div class="modal-section">
        <h2>📞 Call Us:</h2>
        <div class="contact-box">
          <div class="contact-item">
            <span>(+1) United States</span>
            <div class="contact-info">1-951-225-4560</div>
          </div>
	  <div class="contact-item">
            <span>(+44) United Kingdom</span>
            <div class="contact-info">0-800-410-1205</div>
          </div>
          <div class="contact-item">
            <span>(+61) Australia</span>
            <div class="contact-info">1-800-223-611</div>
          </div>          
        </div>
        <p class="small-text">Please ensure you dial the correct country code if you're calling from abroad.</p>
      </div>

      <div class="modal-section">
        <h2>🌐 Connect with Us Online:</h2>
        <div class="contact-box">
          <a href="https://247t.tech" target="_blank" rel="noopener noreferrer" class="contact-info-link">247t.tech</a>
        </div>
        <p>Visit our support portal at 247t.tech to:</p>
        <ul>
          <li>Chat live with a support agent</li>
          <li>Submit a help request or ticket</li>
          <li>Access guides, FAQs, and service updates</li>
          <li>Track your ongoing support cases</li>
        </ul>
      </div>

    </div>
  `;

  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer);
  
  // Add blur effect to the page content
  document.body.style.overflow = 'hidden'; // Prevent scrolling while modal is open
  document.documentElement.classList.add('support-modal-open');


  // 2. Function to close the modal
  function closeModal() {
    document.documentElement.classList.remove('support-modal-open');
    document.body.style.overflow = 'auto';
    modalContainer.remove();
  }

  // 3. Add event listener to close the modal - ONLY for the close button.
  document.getElementById('support-modal-close-btn').addEventListener('click', closeModal);
  // The event listener for the backdrop has been removed as requested.

})();
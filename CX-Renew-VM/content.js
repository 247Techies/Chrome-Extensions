// We use a self-invoking function to avoid polluting the global scope
(function() {
    // Prevent the script from running multiple times on the same page
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
  
    let captureState = 'AWAITING_NAME'; // Initial state
    let cx_name = null;
    let sub_exp_date = null;
  
    // Function to get the selected text
    function handleMouseUp() {
      const selectedText = window.getSelection().toString().trim();
  
      if (selectedText.length > 0) {
        if (captureState === 'AWAITING_NAME') {
          cx_name = selectedText;
          captureState = 'AWAITING_DATE';
          // Optional: Give user feedback
          console.log(`Name captured: ${cx_name}. Now select the subscription date.`);
          // You could add a small, temporary notification on the screen here if desired
        } else if (captureState === 'AWAITING_DATE') {
          sub_exp_date = selectedText;
          captureState = 'DONE';
          console.log(`Date captured: ${sub_exp_date}. Displaying modal.`);
          
          // Both items are captured, so show the modal
          showModal();
  
          // Stop listening for more selections
          document.removeEventListener('mouseup', handleMouseUp);
        }
      }
    }
  
    // Function to create and display the modal
    function showModal() {
      // Blur the background
      const backdrop = document.createElement('div');
      backdrop.id = 'my-extension-backdrop';
      
      // Create the modal container
      const modal = document.createElement('div');
      modal.id = 'my-extension-modal';

      // Construct the inner content of the modal
      // UPDATED: Wrapped phone numbers in <strong> tags for specific styling
      modal.innerHTML = `
        <div class="my-extension-modal-content">
          <p>Hi, <strong>${cx_name}</strong> This is Aiden from 247 Techies. I'm reaching out to inform you that your subscription with us expired on <strong>${sub_exp_date}</strong></p>
          <p>We’ve sent you an email containing a link to renew your subscription. To ensure uninterrupted service, we kindly encourage you to complete the renewal at your earliest convenience.</p>
          <p>If you need any assistance with the renewal process or have any questions, please don't hesitate to contact us at</p>
          <div class="my-extension-contact-info">
            US: <strong>1-951-225-4560</strong><br>
            UK: <strong>0-800-410-1205</strong><br>
            AUS: <strong>1-800-223-611</strong>
          </div>
          <p>Our team is here to help.</p>
          <p>Thank you for choosing 247 Techies.</p>
          <button id="my-extension-close-btn">×</button>
        </div>
      `;

      // Append the backdrop and modal to the body
      document.body.appendChild(backdrop);
      document.body.appendChild(modal);

      // Add event listener to the close button
      document.getElementById('my-extension-close-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.removeChild(backdrop);
        // Reset state in case user wants to use it again on the same page
        window.hasRun = false; 
      });
    }
    
    // Inject the CSS file into the page
    function injectStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('style.css');
        document.head.appendChild(link);
    }
  
    // ---- Main Execution ----
    console.log("Extension activated. Please select the customer's name.");
    injectStyles();
    document.addEventListener('mouseup', handleMouseUp);
  
  })();
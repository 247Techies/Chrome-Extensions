(function() {
  // The entire script is now inside this function wrapper.
  // This creates a private scope, preventing re-declaration errors on multiple clicks.

  // --- Helper Functions ---

  // Converts "rOy SHAPE" to "Roy Shape"
  function toProperCase(str) {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // --- Main Logic ---

  const CASE_STATES = ['proper', 'upper', 'lower'];
  const activeElement = document.activeElement;

  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    
    // 1. DETERMINE THE NEXT STATE
    const currentState = activeElement.dataset.caseCycleState;
    const currentStateIndex = CASE_STATES.indexOf(currentState);
    const nextStateIndex = (currentStateIndex + 1) % CASE_STATES.length;
    const nextState = CASE_STATES[nextStateIndex];
    
    // 2. APPLY THE TRANSFORMATION
    const originalValue = activeElement.value;
    let newValue = '';
    
    switch (nextState) {
      case 'proper':
        newValue = toProperCase(originalValue);
        break;
      case 'upper':
        newValue = originalValue.toUpperCase();
        break;
      case 'lower':
        newValue = originalValue.toLowerCase();
        break;
      default:
        newValue = toProperCase(originalValue);
        break;
    }
    
    // This part is the same: we change the visual value first.
    activeElement.value = newValue;
    
    // 3. SAVE THE NEW STATE FOR OUR EXTENSION
    activeElement.dataset.caseCycleState = nextState;

    // 4. *** THE CRITICAL FIX ***
    // Tell the website's framework (React, Vue, etc.) that a change has occurred.
    // We create and dispatch an 'input' event, just like if a user had typed.
    const event = new Event('input', { bubbles: true, cancelable: true });
    activeElement.dispatchEvent(event);
  }

})();
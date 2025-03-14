window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('c1').addEventListener('click', copy1);

  function copy1() {
    // Get the text field
    const copyText = document.getElementById('chrome-version');

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

     // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);

    // Alert the copied text
    alert('Copied `' + copyText.value + '` to the clipboard');
  }
});

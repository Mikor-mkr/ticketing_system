async function testAPI() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Loading...';
    
    try {
        // Use full URL when servers are separate
        const response = await fetch('http://localhost:8000/');
        const data = await response.json();
        
        resultDiv.innerHTML = `<p>API Response: ${data.message}</p>`;
        console.log('Success:', data);
    } catch (error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error('Error:', error);
    }
}
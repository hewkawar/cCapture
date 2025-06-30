window.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam');

    
    const width = parseInt(process.env.CCAPTURE_WIDTH) || 1920;
    const height = parseInt(process.env.CCAPTURE_HEIGHT) || 1080;
    const fps = parseInt(process.env.CCAPTURE_FPS) || 50;
    const zoom = parseInt(process.env.CCAPTURE_ZOOM) || 100;

    video.style.scale = `${zoom}%`;

    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: width },   // or exact: 1920
            height: { ideal: height },  // or exact: 1080
            frameRate: { ideal: fps }, // optional
        },
    })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error('Error accessing webcam:', err);
            alert('Could not access webcam');
        });
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        if (confirm('Are you sure you want to exit?')) {
            window.close(); // Close the window
        }
    }
});
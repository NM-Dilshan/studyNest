const http = require('http');

const testData = {
  response_id: 'd8a5af81-025f-4d9b-9b16-dfcceed0896b',
  request_id: '8fbcd882-4b65-406a-b5af-a03d8c844352',
  user_id: 'd402737d-9b0c-472d-9002-4490c93ce69e',
  stars: 5,
  comment: 'Great response! Very helpful.'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/volunteer-feedback',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${testData.user_id}`
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Feedback API Test');
      console.log('Status Code:', res.statusCode);
      console.log('Success:', response.success);
      if (response.success) {
        console.log('Feedback ID:', response.data?.feedback_id);
        console.log('Stars:', response.data?.stars);
        console.log('Message:', response.message);
      } else {
        console.log('Error:', response.error);
      }
    } catch (e) {
      console.error('Parse Error:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.write(postData);
req.end();

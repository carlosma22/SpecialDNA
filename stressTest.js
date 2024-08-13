import http from 'k6/http';
import { check, sleep } from 'k6';

function generateDNAString(length) {
  const characters = 'AGCT';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateDNAArray(n) {
  let dnaArray = [];
  for (let i = 0; i < n; i++) {
      dnaArray.push(generateDNAString(n));
  }
  return dnaArray;
}

export let options = {
  stages: [
    { duration: '1m', target: 10000 }, // 1000 usuarios concurrentes en 1 minuto
  ],
};

export default function () {
  const arraySize = Math.floor(Math.random() * 11);
  const dnaArray = generateDNAArray(arraySize);
  const payload = JSON.stringify({ dna: dnaArray });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let postResponse = http.post('http://localhost:3000/dna-special', payload, params);
  check(postResponse, {
    'status was 200': (r) => r.status === 200,
    'status was 422': (r) => r.status === 422,
    'status was 500': (r) => r.status === 500,
    'status was 403': (r) => r.status === 403,
  });

  let getResponse = http.get('http://localhost:3000/dashboard');
  check(getResponse, {
    'status was 200': (r) => r.status === 200,
    'status was 500': (r) => r.status === 500,
  });
  
  sleep(1);
}

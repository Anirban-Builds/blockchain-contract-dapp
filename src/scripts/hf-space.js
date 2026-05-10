import 'dotenv/config'

const check = await fetch(`https://huggingface.co/api/spaces/Anirban0011/${process.env.REPO}`, {
  headers: { 'Authorization': `Bearer ${process.env.HF_TOKEN}` }
})

if (check.status === 404) {
  const res = await fetch('https://huggingface.co/api/repos/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: process.env.REPO,
      type: 'space',
      sdk: 'docker',
      private: false
    })
  })
  console.log(await res.json())
}
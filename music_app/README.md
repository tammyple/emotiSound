# EmotiSound — Mood-Driven, AI-Assisted Music App

EmotiSound is a browser-based app that turns a listener’s self-reported mood and style into AI-generated audio clips. 

Users can shape their own music by editing musical elements (instrument, genre, etc.) or change their current mood, and the system will generate a new piece of music. 

## App Setup

cd music_app
python3 -m venv .venv
. .venv/bin/activate
pip3 install Flask
npm init -y
npm install @google/genai dotenv wav-encoder
python3 -m flask --app app run --debug

## Features

Onboarding: intention > mood > music style 

Generate music: builds a base prompt and renders a short WAV.

Steerable edits: change instrument / genre / tempo / creativity.

Update mood: Change mood and style in main page

Lightweight authentication: register, sign-in, or continue as guest (with hashed passwords).

Feedback: optional two-question prompt after a few plays.

## Tech stack

Backend: Python, Flask, SQLite 

Frontend: HTML, CSS, JS

Others: Node.js, @google/genai for Lyria RealTime


## Core routes

/auth, /register, /login, /guest, /logout : authentication 

/question/<page_type> : for intention/mood/style screens (collecting user options)

/save-answer : stores user selections

/get-wav : generates first Lyria clip

/latest-lyria : returns the latest WAV path

/edit-lyria : regenerates music with new instrument/genre/bpm/creativity

/update-mood : updates mood/style 

/submit-feedback : stores two-question survey

## Reference

### Helper function to add PCM chunks to WAV 
https://github.com/googleapis/js-genai/issues/695

### Lyria RealTime: Generate track and edit prompts
https://ai.google.dev/gemini-api/docs/music-generation#python
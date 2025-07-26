from magenta_rt import audio, system
from IPython.display import display, Audio

num_seconds = 10
mrt = system.MagentaRT()
style = system.embed_style('funk')

chunks = []
state = None
for i in range(round(num_seconds / mrt.config.chunk_length)):
  state, chunk = mrt.generate_chunk(state=state, style=style)
  chunks.append(chunk)
generated = audio.concatenate(chunks, crossfade_time=mrt.crossfade_length)
display(Audio(generated.samples.swapaxes(0, 1), rate=mrt.sample_rate))

# Save to WAV file
generated.to_file("generated_funk.wav")
print("Generated music saved as generated_funk.wav")
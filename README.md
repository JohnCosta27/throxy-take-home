# Throxy Take Home Exercise

## [Demo](https://youtu.be/G4SJBI2MpoY)

## [Production Link](https://throxy-take-home.vercel.app)

## Paper Plan

![First](https://i.imgur.com/wu0Kn9D_d.webp?maxwidth=1520&fidelity=grand)
![Second](https://i.imgur.com/uYrvuKL_d.webp?maxwidth=1520&fidelity=grand)

## Architecture

This system is fairly simple, it consists of:

- PostgresDB with Supabase
- Realtime updates with Supabase
- Nextjs frontend & backend
- OpenAI for enhancement

What happens to a CSV after you insert it?

1. The file is inserted into the DB. And if parsed successfully, each row is inserted in a seperate table.
2. After this, a request is sent to start processing on each of the new rows.
3. The rows are pre-processed (regex, trimming, etc...), and then they are chunked (10 rows is the default), and each of these chunks is sent to AI to improve.
4. The rows are updated on the DB, but the original data is preserved.

This architecture is ideal IF the backend wasn't Next.js. This would be perfect in an event-driven architecture using a real server. But it still works!

## Total Time

It took me about 4 hours of focused work to complete this (not in one go). I really enjoyed it!

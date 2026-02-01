# Real-Time Disaster Information Aggregation Software
Submission for the Online round of SSH'26 by O(1).


RT-DIAS is an event-driven microservices platform that transforms chaotic social media noise into actionable disaster intelligence for emergency response teams. By leveraging computer vision, multilingual NLP, and real-time geospatial analysis, we convert the visual and vernacular web into lifesaving signals for organizations like India's NDRF (National Disaster Response Force).

The Problem: In disaster scenarios, critical hours are lost due to bureaucratic reporting bottlenecks. Social media contains ground-truth evidence, but it's buried in terabytes of unstructured data across multiple languages and formats.
Our Solution: Real-time aggregation, AI-powered verification, and intelligent routing of disaster intelligence from Instagram, GDELT, and other OSINT sources.

The main page consists of all the active events that are reported on the internet and scraped by our system(currently we pre-feed the data since API services aren't active and some of them are paid)

<img width="1916" height="947" alt="Screenshot 2026-02-01 144430" src="https://github.com/user-attachments/assets/6dd36cfb-3c8a-4ede-b7d8-9f8f5bf05022" />

We also added a live Disaster Map to display the disasters acrros the map and give info on them 
<img width="1919" height="946" alt="2" src="https://github.com/user-attachments/assets/51c571eb-7870-4238-97c2-15b97591e84b" />

Along with that a Live News Feed connected with newsdata.io that gives news from all over india with the source
<img width="1913" height="940" alt="image" src="https://github.com/user-attachments/assets/d02db02c-e4ef-4b66-adaf-ee5695c9cf56" />

Next we added a Global Event Tracker(GDELT Project) which has a time range and a region filter - this gives you the reports from the authentic news sources of the respective countries in their respective language
<img width="1918" height="946" alt="4" src="https://github.com/user-attachments/assets/18ece5c1-8565-4452-81d9-7c0b31270e49" />




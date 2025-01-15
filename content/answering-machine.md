---
title: "The Answering Machine"
date: 2019-07-03
categories: ["project overview"]
personal: "Y"
stack: ["Python", "React", "AWS Lambda"]
project_link: "http://voicequery-dev.s3-website-us-west-2.amazonaws.com/"
github_link: "https://github.com/hockenmaier/voicequery"
short_description: "An NLP-driven analytics system enabling users to query their data in plain English."
tags: ["NLP", "serverless", "data analytics"]
---

**The Answering Machine** is a proof-of-concept system that uses natural language processing (NLP) to produce answers to questions asked about data in plain English.

**Try it here:** [http://voicequery-dev.s3-website-us-west-2.amazonaws.com/](http://voicequery-dev.s3-website-us-west-2.amazonaws.com/)
**Github:** [https://github.com/hockenmaier/voicequery](https://github.com/hockenmaier/voicequery)

![Answering Machine homepage](/images/answering_machine_uploads.png)

It is designed with simplicity in mind — upload any columnar dataset and start asking questions. Advanced NLP algorithms interpret your queries and assumptions, providing answers. You can even correct these assumptions for better follow-up queries.

---

## Features  

- **Upload any dataset**: Users can upload columnar datasets (CSV format) and start querying.  
- **Real-time responses**: Questions are answered instantly, with NLP driving the interpretation and response generation.  
- **Serverless architecture**: The system incurs no hosting costs apart from traffic-based expenses.  

---

## How-to  

On a desktop or tablet, click the link above to navigate to **The Answering Machine**. Currently, it is not optimized for smartphones.  

To use the system:  

1. **Upload a dataset**: Drag and drop a CSV file or use the upload button.  
    - Example files like "HR Activity Sample" are available for testing.  

2. **Start querying**: Select a dataset and type your question in the query bar.  

![HR dataset view](/images/answering_machine_hr.png)  

3. Use the **information panel** to understand dataset fields, data types, and sample values. This helps formulate more specific questions.  

![Info panel](/images/answering_machine_info.png)  

---

## Query Types  

The system currently supports:  

- **Counts**: “How many employees joined in 2020?”  
- **Mathematical questions**: Averages, medians, maximums, and minimums.  
- **Filters**: Combine conditions like “What’s the average salary of engineers in 2019?”  

---

## Concept Matching  

If the NLP system misinterprets a query, users can create **concepts** to align query terms with dataset fields.  

![Answering Machine query bar](/images/answering_machine_query.png)  

Concepts override the system’s auto-matching logic, ensuring accurate data interpretation.  

![Concept creation](/images/answering_machine_concept.png)  

---

## Architecture  

**The Answering Machine** is a purely serverless application. Its backend consists of AWS Lambda functions, API Gateway, and other serverless components.  

![Serverless architecture](/images/answering_machine_architecture.png)  

For more details, check out [Martin Fowler's article on serverless computing](https://martinfowler.com/articles/serverless.html).  

---

Feel free to explore the tool and test various datasets. Remember, this is a proof-of-concept system with no user accounts, so avoid uploading sensitive data.

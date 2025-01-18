---
title: "The Answering Machine"
date: 2019-07-03
categories: ["project overview"]
personal: "Y"
stack: ["Python", "React", "AWS Lambda"]
project_link: "http://voicequery-dev.s3-website-us-west-2.amazonaws.com/"
github_link: "https://github.com/hockenmaier/voicequery"
short_description: "An NLP-driven analytics system enabling users to query their data in plain English."
tags: ["AI", "NLP", "Analytics", "Data Visualization", "Serverless", "Python", "React", "AWS Lambda", "Rapid Prototyping", "System Design"]

---

Note from 2025: The Answering Machine is a proof-of-concept system that I built using pre-LLM natural language processing (NLP), specifically NLTK, to produce answers to questions asked about data in plain English.

Looking back, this project was a great insight into what LLMs immediately allowed that was incredibly difficult before.  This project was several months of work that the openAI sdk would probably have allowed in a few weeks - and that few weeks would have been mostly frontend design and a bit of prompting.

**Try it here:** [http://voicequery-dev.s3-website-us-west-2.amazonaws.com/](http://voicequery-dev.s3-website-us-west-2.amazonaws.com/)
**Github:** [https://github.com/hockenmaier/voicequery](https://github.com/hockenmaier/voicequery)


![Answering Machine homepage](/images/answering_machine_uploads.png)

This proof-of-concept system uses natural language processing (NLP) to produce answers to questions asked about data in plain english.

It is designed with simplicity in mind - upload any columnar dataset and start asking questions and getting answers. It uses some advanced NLP algorithms to make assumptions about what data you're asking about, and will let you correct those assumptions for follow-up questions if they're wrong.

It is built entirely out of serverless components, which means there is no cost to maintain or run it other than the traffic the system receives.

---

### How-to

On a desktop or tablet, click the link in the header to navigate to the answering machine. For now it isn't optimized for smartphone-sized screens.

In order to use the answering machine, you can either select one of the existing data sets such as "HR Activity Sample" or upload one of your own using the homepage of the site:

![Answering Machine homepage](/images/answering_machine_uploads.png)

To upload your own, click in the upload area or just drag a file straight from your desktop. For now, use csv data files. Excel and other spreadsheet programs can easily save data in the csv format using the "File > Save As" or similar option in the menu. Each file needs a unique name.

When you hit the upload button, the site may not appear to change until the file is uploaded, at which point you'll see it appear in the box labeled "Ask Your Data Anything" below. Click on your file to start using it with the answering machine, or click the red trash can icon to delete it.

There are no user accounts in this system yet, so the data you upload might be seen by other users using the system. Try not to use sensitive data for now.

When you enter a dataset, you'll see a view that presents you with a quite a bit of information:

![Main view of Answering Machine](/images/answering_machine_hr.png)

The only part you need to focus on right now is the information panel. This panel lists out all of the fields (columns), data types of those fields, and some sample data from a few records in your data set:

![Answering Machine info panel](/images/answering_machine_info.png)

You can use this panel to start to formulate questions you might have about the data. If you see number values, you might ask about averages, maximums, or other math that might otherwise take some time to calculate. If you see a date, you can ask questions about the data in certain time periods.

Many datasets also contain fields that only have a few specific allowed values. When the answering machine sees less than 15 unique values in any field, the data type will be a "List" and it lists them right out under the sample values table. You can use this type of value to ask questions about records containing those specific values. For example in the HR data set, you might only be interested in data where the "Education" field's value is "High School".

Now look to the query bar to start asking your data questions:

![Answering Machine query bar](/images/answering_machine_query.png)

The types of questions that will currently be automatically detected and answered are:
- Counts of records where certain conditions are true
- Math questions such as averages, medians, maximums, and minimums

These types of questions can be made specific by using qualifying statements with prepositional phrases like "in 2019" or adjective phrases like "male" or "entry-level."

Combining these two ideas, you can ask specific questions with any number of qualifiers, such as: "What was the median salary of male employees in the engineering department 5 years ago?"

Upon hitting the "ask" button (or hitting Enter), the answering machine will do its best to answer your question, and will show you all of its work in this format:

![Answering Machine response](/images/answering_machine_answer.png)

---

### Architecture

The Answering Machine is a purely "serverless" application, meaning that there is no server hosting the various components of the application until those components are needed by a user. This is true for the database, the file storage, the static website, the backend compute, and the API orchestration.

For the cloud nerds out there, [here is a great article](https://martinfowler.com/articles/serverless.html) by Martin Fowler on what exactly "serverless" means, especially in terms of the backend compute portion which is arguably the most valuable part of the application to be serverless. For reference, I am using Martin's 2nd definition of "serverless" here.

This is a high-level map of all of the components that make the answering machine work in its current (June 2020) state. The API gateways, cloudwatch events, and some triggers "given for free" by AWS are left out of this for readability:

![Serverless Architecture of the Answering Machine app](/images/answering_machine_architecture.png)

The full suite of lambdas and persistent storage services that make up the answering machine.

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

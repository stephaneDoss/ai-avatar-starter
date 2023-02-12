import Head from "next/head";
import { useState, useEffect } from "react";
import Image from "next/image";
import buildspaceLogo from "../assets/buildspace-logo.png";

const Home = () => {
  // Don't retry more than 20 times
  const maxRetries = 20;
  const [input, setInput] = useState("");
  const [img, setImg] = useState("");
  // Numbers of retries
  const [retry, setRetry] = useState(0);
  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);
  // Add isGenerating state
  const [isGenerating, setIsGenerating] = useState(false);
  // Add new state here
  const [finalPrompt, setFinalPrompt] = useState("");

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const generateAction = async () => {
    console.log("Generating...");

    // Add this check to make sure there is no double click
    if (isGenerating && retry === 0) return;

    // Set loading has started
    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const finalInput = input.replace("steph", "stephane");

    // Add the fetch request
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        "x-use-cache": "false",
      },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      console.log("Model is loading still :(.");
      return;
    }

    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      // Stop loading
      setIsGenerating(false);
      return;
    }

    // Set final prompt here
    setFinalPrompt(input);
    // Remove content from input box
    setInput("");

    // Set image data into state property
    setImg(data.image);
    // Everything is all done -- stop loading!
    setIsGenerating(false);
  };

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
  // Add useEffect here
  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`
        );
        setRetryCount(maxRetries);
        return;
      }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>AI Avatar Generator | buildspace</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Avatar generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>
              Turn me into anyone you want! Make sure you refer to me as
              "stephane" in the prompt
            </h2>
            <div className="prompt-container">
              <input
                className="prompt-box"
                value={input}
                onChange={onChange}
                // defaultValue="Highly detailed 4k photograph of stephane being silly at his job as a basket weaver "
              />
              <div className="prompt-buttons">
                {/* Tweak classNames to change classes */}
                <a
                  className={
                    isGenerating ? "generate-button loading" : "generate-button"
                  }
                  onClick={generateAction}
                >
                  {/* Tweak to show a loading indicator */}
                  <div className="generate">
                    {isGenerating ? (
                      <span className="loader"></span>
                    ) : (
                      <p>Generate</p>
                    )}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add output container */}
      {img && (
        <div className="output-content">
          <Image src={img} width={512} height={512} alt={input} />
          {/* Add prompt here */}
          <p>{finalPrompt}</p>
        </div>
      )}
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;

# Server Verification Instructions for AI Assistant

## Important Rule

Never tell the user that a server is ready just because you ran the start command. You must always verify that the server is actually working before saying it's ready to test.

## What You Must Do Every Time You Start a Server

### Step 1: Check if the port is available

Before starting any server, first check if the port you want to use (like port 3000) is already being used by another program. If something is already using that port, you need to stop that program first, or choose a different port.

### Step 2: Clean up any conflicts

If you find that the port is already in use, stop whatever program is using it. Wait a moment to make sure it's fully stopped before moving on.

### Step 3: Start the server with logging

When you start the server, make sure you're saving all the output messages to a log file. This way, if something goes wrong, you can look at what happened. Remember what process ID the server is using so you can stop it later if needed.

### Step 4: Wait for the server to fully start

Don't immediately check if the server is working. Servers need time to start up completely. Wait at least 3 to 5 seconds before checking anything. Some servers (like React applications) might need even more time, so be patient.

### Step 5: Verify the server is actually listening

Now check if the server is actually listening on the port you specified. This means checking that the server program has successfully opened the port and is waiting for connections. If it's not listening after waiting, something went wrong during startup.

### Step 6: Test that the server responds

Just because a server is listening doesn't mean it's working correctly. Send a test request to the server and make sure it responds. The server should send back a proper response, not an error.

### Step 7: Verify the correct application is running

Check that the server is actually serving the application you expect. Look for specific content that should be there. For example:
- If it's a Next.js app, look for Next.js specific elements
- If it's a React app, look for the React root element
- If it's your specific application, look for text or elements that are unique to your app

### Step 8: Only then tell the user it's ready

Only after all these checks pass should you tell the user that the server is ready. When you do, give them:
- The exact URL they should use (like http://localhost:3000)
- Confirmation that you've verified it's actually working
- Any specific details about what you verified

## What to Do When Things Go Wrong

### If the server won't start

Look at the log file you created. Find any error messages and share them with the user. Check if all the project dependencies are installed. Make sure you're in the right directory.

### If the server starts but won't respond

The server might be starting on a different port than expected. Check the log messages for any mention of what port it's actually using. The server might be only listening locally and not accepting outside connections.

### If the server responds but shows the wrong content

You might be running a different application than expected. There might be multiple servers running on different ports. The build might be outdated.

## Special Instructions for Different Types of Applications

### For Next.js applications

Next.js apps usually start on port 3000. They take a bit longer to start because they need to compile. Look for Next.js specific content in the response to verify it's running.

### For React applications

React development servers often start on port 3000 but will automatically use 3001 or 3002 if 3000 is busy. They show clear messages in the logs about which port they chose. They take longer to start up, sometimes 5-10 seconds.

### For Python applications

Python servers often use port 5000 or 8000. They usually start faster than JavaScript applications. Make sure you're using the right Python environment.

## Important Reminders

Always complete all verification steps. Don't skip steps even if you think the server is working. If any step fails, don't proceed to the next step. Instead, troubleshoot the problem. Always tell the user if something isn't working as expected.

Keep checking the server logs while troubleshooting. Error messages in the logs usually explain what's wrong. When the user reports a problem, first check if the server is still running and responding.

Never assume the server is working. Always verify through actual tests. If the user says they can't see the application in their browser, go through all the verification steps again.

## Summary of the Process

First, make sure the port is free. Then clean up any conflicts. Start the server and keep the logs. Wait for it to initialize completely. Check that it's listening on the port. Test that it responds to requests. Verify it's serving the right content. Only then tell the user it's ready.

If anything fails at any step, stop and troubleshoot before moving forward. Always be thorough in your verification. The extra time spent checking saves much more time than dealing with "it's not working" issues later.

Remember: The goal is to be absolutely certain the server is working before telling the user to check their browser. This prevents frustration and wasted time.

Thank you for following these instructions carefully!
/*
Write a program that uses process.stdin to read user 
input from the command line. Ask the user for their 
name and greet them by printing "Hello, [name]!" to the 
console. 
*/

process.stdin.on('data',(data) => {
    console.log("Hello, " + data);
});
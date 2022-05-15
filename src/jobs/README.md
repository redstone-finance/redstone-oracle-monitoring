# Jobs

This folder contains implementation of "jobs". Each job is a js module with an exported `async execute` function. This function can contain additional arguments and will be called by the job scheduler in each interation.

Note: job scheduling is not implemented in jobs. The job files only contain the logic of a single job iteration.

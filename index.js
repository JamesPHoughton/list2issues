const { Toolkit } = require('actions-toolkit')

// Run your GitHub Action!
Toolkit.run(async tools => {

  const listFile = tools.inputs.filename

  // Get the file
  tools.log.debug('Reading from file', listFile)
  const text = await tools.readFile(listFile)

  // break the file apart into milestones
  const milestones = text.split(/.*(?=[\r\n]\#\s)/).map(x => x.trim())

  milestones.map( ms => {
    const ms_title = ms.split(/[\r\n]/)[0].slice(1).trim()
    const ms_description = ms.split(/[\n\r]\##\s/)[0].split(/[\n\r]/).slice(1).join('\n')

    const newMilestone = await tools.github.issues.createMilestone({
      ...tools.context.repo,
      title: ms_title,
      description: ms_description,
      state: 'open'
    });
    tools.log.success(`Created Milestone ${newMilestone.data.title}#${newMilestone.data.number}`)

    // break milestone apart into issues
    const issues = ms.split(/[\r\n]\#\#\s/).slice(1)
    issues.map( iss => {
      const lines = iss.split(/[\n\r]/)
      const iss_title = lines[0]
      const body = lines.slice(1).join('\n')

      const newIssue = await tools.github.issues.create({
        ...tools.context.repo,
        title: iss_title,
        body: body,
        milestone: newMilestone.data.number
      })
      tools.log.success(`Created issue ${newIssue.data.title}#${newIssue.data.number}: ${newIssue.data.html_url}`)

    });
  }

  tools.exit.success('We did it!')



}, {
  secrets: ['GITHUB_TOKEN']
})

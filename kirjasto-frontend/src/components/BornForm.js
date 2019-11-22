import React, { useState } from 'react'

const BornForm = (props) => {
    const [name, setName] = useState('')
    const [born, setBorn] = useState('')

    if (!props.show) {
        return null
      }

    if (props.result.loading) {
    return <div>loading...</div>
    }

    const authors = props.result.data.allAuthors
    console.log('BornForm authors', authors)
  
    const submit = async (e) => {
      e.preventDefault()
      const setBornTo = born
  
      await props.editAuthor({
        variables: { name, setBornTo }
      })
  
      setName('')
      setBorn('')
    }
  
    return (
      <div>
        <h2>Set birth year</h2>
        <form onSubmit={submit}>
        <select value={name} onChange={({ target }) => setName(target.value)}>
          {authors.map(a =>
              <option key={a.name} value={a.name}>{a.name}</option>
          )}
          </select>
          <div>
            born <input
              value={born}
              onChange={({ target }) => setBorn(Number(target.value))}
            />
          </div>
          <button type='submit'>Update author</button>
        </form>
      </div>
    )
  }

  export default BornForm
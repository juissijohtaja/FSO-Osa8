import React, { useState } from 'react'

const BornForm = (props) => {
    const [name, setName] = useState('')
    const [born, setBorn] = useState('')

    if (!props.show) {
        return null
      }
  
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
          <div>
            name <input
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
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
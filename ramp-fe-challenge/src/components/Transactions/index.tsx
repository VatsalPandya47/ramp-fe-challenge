import { useCallback, useState } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const [searchTerm, setSearchTerm] = useState("")

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.merchant.toLowerCase().includes(searchLower) ||
      transaction.employee.firstName.toLowerCase().includes(searchLower) ||
      transaction.employee.lastName.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      <div className="RampBreak--l" />
      <input
        type="text"
        placeholder="Search transactions..."
        className="RampTextInput"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="RampBreak--l" />
      <div data-testid="transaction-container">
        {filteredTransactions.map((transaction) => (
          <TransactionPane
            key={transaction.id}
            transaction={transaction}
            loading={loading}
            setTransactionApproval={setTransactionApproval}
          />
        ))}
      </div>
    </div>
  )
}

<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class AccountIdGenerator
{
    public function preview(string $accountType): string
    {
        $configuration = $this->configuration($accountType);
        $sequence = DB::table('account_id_sequences')
            ->where('account_type', $accountType)
            ->first();

        if (! $sequence) {
            throw new RuntimeException("The account ID sequence for [{$accountType}] is missing.");
        }

        $number = max(
            (int) $sequence->next_value,
            $this->highestExistingNumber($configuration) + 1,
        );

        return $configuration['prefix'].'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }

    public function next(string $accountType): string
    {
        $configuration = $this->configuration($accountType);

        $sequence = DB::table('account_id_sequences')
            ->where('account_type', $accountType)
            ->lockForUpdate()
            ->first();

        if (! $sequence) {
            throw new RuntimeException("The account ID sequence for [{$accountType}] is missing.");
        }

        $number = max(
            (int) $sequence->next_value,
            $this->highestExistingNumber($configuration) + 1,
        );

        DB::table('account_id_sequences')
            ->where('account_type', $accountType)
            ->update(['next_value' => $number + 1]);

        return $configuration['prefix'].'-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT);
    }

    /** @return array{prefix: string, table: string, column: string} */
    private function configuration(string $accountType): array
    {
        return match ($accountType) {
            'Faculty' => ['prefix' => 'FCT', 'table' => 'faculties', 'column' => 'faculty_number'],
            'Student' => ['prefix' => 'STD', 'table' => 'students', 'column' => 'student_number'],
            default => throw new RuntimeException("Unsupported account type [{$accountType}]."),
        };
    }

    /** @param array{prefix: string, table: string, column: string} $configuration */
    private function highestExistingNumber(array $configuration): int
    {
        return DB::table($configuration['table'])
            ->pluck($configuration['column'])
            ->reduce(function (int $highest, string $identifier) use ($configuration): int {
                if (preg_match('/^'.preg_quote($configuration['prefix'], '/').'-(\d+)$/i', $identifier, $matches)) {
                    return max($highest, (int) $matches[1]);
                }

                return $highest;
            }, 0);
    }
}

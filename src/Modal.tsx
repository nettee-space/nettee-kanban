import { Editor } from '@/Editor';
import { Button } from '@/shared/components/ui/button';

interface ModalProps {
  onClose: () => void;
}

export function Modal({ onClose }: ModalProps) {
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form className="fixed mx-auto flex w-[90%] md:w-[60%]">
        <article className="h-[calc(100vh-2rem)] w-full min-w-[320px] rounded-lg bg-white p-6 text-start md:h-[660px]">
          <header className="mb-4">
            <Button
              className="absolute top-4 right-4 font-bold text-neutral-400 hover:bg-transparent"
              variant="ghost"
              onClick={onClose}
            >
              ✕
            </Button>
            <div className="mb-2">
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-bold text-neutral-400"
              >
                제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="제목을 입력해주세요"
                className="w-full rounded-lg bg-neutral-100 p-3 text-base font-bold text-neutral-400"
              />
            </div>
          </header>

          <section className="flex h-[calc(100%-5rem)] flex-col overflow-hidden">
            <label
              id="content-label"
              className="mb-1 block text-sm font-bold text-neutral-400"
            >
              상세 내용
            </label>
            <Editor />
          </section>
        </article>
      </form>
    </main>
  );
}

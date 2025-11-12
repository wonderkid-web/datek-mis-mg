import Link from 'next/link'

export default function CCTVViewLink({ link }: { link: string }) {
    return (
        <Link className="bg-blue-700 text-white rounded-md px-2 py-1 font-bold hover:bg-blue-800" href={link ?? '#'} target="_blank">Lihat Kamera</Link>
    )
}


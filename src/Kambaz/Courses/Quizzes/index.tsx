import { Link, useParams } from "react-router-dom";

export default function Quizzes() {
  const { cid } = useParams();

  // console.log("🔍 Quizzes component rendering");
  // console.log("📋 Course ID:", cid);

  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-semibold">Quizzes</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
      <h2>Quizzes for Course {cid}</h2>


        {/* TEMPORARY DEBUG SECTION */}
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <Link to={`/Kambaz/Courses/${cid}/Quizzes/quiz123/Questions`}>
            <strong>[ GO TO QUESTIONS EDITOR ]</strong>
          </Link>
        </div>

      </div>
    </div>
  );
}